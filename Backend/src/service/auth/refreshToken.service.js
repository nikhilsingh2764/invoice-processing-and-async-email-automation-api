import jwt from "jsonwebtoken";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";
import ApiError from "../../utils/ApiError.js";
import redis from "../../config/redis.js";
import userRepository from "../../repository/auth/user.repository.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";
import hashToken from "../../utils/hashToken.js";
import { issueTokenPair } from "../../utils/tokens.js";

// Browsers can fire several refresh requests at once (multiple tabs / parallel API calls).
// The first one rotates the token; the others receive the SAME new pair for a few seconds
// instead of being treated as token theft.
const GRACE_SECONDS = 10;
const GRACE_POLL_ATTEMPTS = 10;
const GRACE_POLL_INTERVAL_MS = 150;

const graceKey = (oldTokenHash) => `refresh:grace:${oldTokenHash}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Looks for the token pair created by a concurrent request that already rotated this token.
const findGracePair = async (oldTokenHash) => {
    for (let attempt = 0; attempt < GRACE_POLL_ATTEMPTS; attempt++) {
        const cached = await redis.get(graceKey(oldTokenHash));

        if (cached) {
            const { newAccessToken, newRefreshToken } = JSON.parse(cached);
            return { newAccessToken, newRefreshToken };
        }

        await sleep(GRACE_POLL_INTERVAL_MS);
    }

    return null;
};

const RefreshTokenService = async (refreshToken, language = "en") => {
    // Check refresh token exists
    if (!refreshToken) {
        logger.warn("Refresh token request failed: token missing");
        throw new ApiError(401, translate("AUTH.TOKEN_REQUIRED", language));
    }

    // Verify refresh token signature & decode
    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, {
            algorithms: ["HS256"],
        });
    } catch (error) {
        logger.warn("Refresh token verification failed");
        throw new ApiError(401, translate("AUTH.INVALID_TOKEN", language));
    }

    const hashedIncomingToken = hashToken(refreshToken);

    // Atomically take the stored token. Only one concurrent request can succeed.
    const storedToken = await refreshTokenRepository.consumeByTokenHash(hashedIncomingToken);

    if (!storedToken) {
        // Rotated a moment ago by a parallel request? Hand out the same new pair.
        const gracePair = await findGracePair(hashedIncomingToken);

        if (gracePair) {
            logger.warn(
                `Concurrent refresh race condition handled via grace period for user: ${decoded.id}`
            );
            return gracePair;
        }

        // REUSE DETECTION: a token that was already used (or revoked) comes back later.
        try {
            await refreshTokenRepository.revokeAllUserSessions(decoded.id);
            logger.error(
                `Security Alert: Refresh token reuse detected for user ${decoded.id}. All sessions revoked.`
            );
        } catch (err) {
            logger.error(`Failed to revoke sessions during reuse detection: ${err.message}`);
        }

        throw new ApiError(
            403,
            translate("AUTH.TOKEN_REUSE_DETECTED", language) ||
                "Security Alert: Refresh token reuse detected. Please log in again."
        );
    }

    // The token record must belong to the user inside the JWT
    if (String(storedToken.userId) !== String(decoded.id)) {
        logger.error(`Refresh token user mismatch for token owner ${storedToken.userId}`);
        throw new ApiError(401, translate("AUTH.INVALID_TOKEN", language));
    }

    // Check if token is marked revoked or expired explicitly
    if (storedToken.isRevoked || new Date() > storedToken.expiresAt) {
        throw new ApiError(403, translate("AUTH.TOKEN_EXPIRED", language));
    }

    // Find user
    const user = await userRepository.findById(decoded.id);

    if (!user) {
        logger.warn(`Refresh token used for unknown user: ${decoded.id}`);
        throw new ApiError(401, translate("AUTH.USER_NOT_FOUND", language));
    }

    // Check account status
    if (!user.isActive) {
        logger.warn(`Refresh token used for inactive account: ${user._id}`);
        throw new ApiError(403, translate("AUTH.ACCOUNT_INACTIVE", language));
    }

    // Generate the new token pair and store only the HASH of the new refresh token
    const {
        accessToken,
        refreshToken: newRefreshToken,
        refreshTokenHash,
        refreshTokenExpiresAt,
    } = issueTokenPair(user);

    await refreshTokenRepository.create({
        userId: user._id,
        tokenHash: refreshTokenHash,
        expiresAt: refreshTokenExpiresAt,
    });

    // Keep the new pair in Redis for a few seconds so parallel requests with the old token
    // receive the same result (see findGracePair).
    await redis.set(
        graceKey(hashedIncomingToken),
        JSON.stringify({ newAccessToken: accessToken, newRefreshToken }),
        "EX",
        GRACE_SECONDS
    );

    logger.info(`Refresh token rotated successfully: ${user._id}`);

    return {
        newAccessToken: accessToken,
        newRefreshToken,
    };
};

export default RefreshTokenService;
