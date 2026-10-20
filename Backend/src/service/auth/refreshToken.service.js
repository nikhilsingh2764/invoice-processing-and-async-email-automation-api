import jwt from "jsonwebtoken";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";
import ApiError from "../../utils/ApiError.js";
import userRepository from "../../repository/auth/user.repository.js";
import generateToken from "../../utils/generateToken.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";
import hashToken from "../../utils/hashToken.js";

const RefreshTokenService = async (refreshToken, language = "en") => {
    // Check refresh token exists
    if (!refreshToken) {
        logger.warn("Refresh token request failed: token missing");
        throw new ApiError(401, translate("AUTH.TOKEN_REQUIRED", language));
    }

    // Verify refresh token signature & decode
    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        logger.warn("Refresh token verification failed");
        throw new ApiError(401, translate("AUTH.INVALID_TOKEN", language));
    }

    // Hash the incoming token to check against database
    const hashedIncomingToken = hashToken(refreshToken);
    let storedToken = await refreshTokenRepository.findByTokenHash(hashedIncomingToken);

    if (!storedToken) {
        // RACE CONDITION GRACE PERIOD CHECK:
        // Check if this token was recently rotated (e.g., within the last 10 seconds).
        // This handles concurrent requests from multiple browser tabs seamlessly.
        const recentlyRotatedToken = (await refreshTokenRepository.findRecentlyRotatedByHash)
            ? await refreshTokenRepository.findRecentlyRotatedByHash(hashedIncomingToken)
            : null; // Fallback if your repo doesn't have this yet, or you can check token family/rotated records

        // Alternatively, if you track replacement tokens directly on rotation:
        if (storedToken && storedToken.replacementAccessToken) {
            return {
                newAccessToken: storedToken.replacementAccessToken,
                newRefreshToken: storedToken.replacementRefreshToken,
            };
        }

        // If your repository retains rotated records with grace windows:
        if (recentlyRotatedToken && recentlyRotatedToken.replacementAccessToken) {
            logger.warn(
                `Concurrent refresh race condition handled via grace period for user: ${decoded.id}`
            );
            return {
                newAccessToken: recentlyRotatedToken.replacementAccessToken,
                newRefreshToken: recentlyRotatedToken.replacementRefreshToken,
            };
        }

        // REUSE DETECTION / THEFT ALERT (True attack scenario outside grace period):
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

    // 4. Check if token is marked revoked or expired explicitly
    if (storedToken.isRevoked || new Date() > storedToken.expiresAt) {
        throw new ApiError(403, translate("AUTH.TOKEN_EXPIRED", language));
    }

    // 5. Find user
    const user = await userRepository.findById(decoded.id);

    if (!user) {
        logger.warn(`Refresh token used for unknown user: ${decoded.id}`);
        throw new ApiError(401, translate("AUTH.USER_NOT_FOUND", language));
    }

    // 6. Check account status
    if (!user.isActive) {
        logger.warn(`Refresh token used for inactive account: ${user._id}`);
        throw new ApiError(403, translate("AUTH.ACCOUNT_INACTIVE", language));
    }

    // 8. Generate new access token
    const newAccessToken = generateToken(
        {
            id: user._id,
            email: user.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
    );

    // 9. Generate new refresh token
    const newRefreshToken = generateToken(
        {
            id: user._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_EXPIRES_IN || "15d"
    );

    const parseExpiresInToMs = (expiresInStr) => {
        if (!expiresInStr) return 15 * 24 * 60 * 60 * 1000;
        if (typeof expiresInStr === "number") return expiresInStr;
        const match = expiresInStr.match(/^(\d+)([d|h|m|s])$/);
        if (!match) return 15 * 24 * 60 * 60 * 1000;
        const val = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case "d":
                return val * 24 * 60 * 60 * 1000;
            case "h":
                return val * 60 * 60 * 1000;
            case "m":
                return val * 60 * 1000;
            case "s":
                return val * 1000;
            default:
                return 15 * 24 * 60 * 60 * 1000;
        }
    };

    const refreshTokenExpiresAt = new Date(
        Date.now() + parseExpiresInToMs(process.env.REFRESH_TOKEN_EXPIRES_IN)
    );

    const newTokenHash = hashToken(newRefreshToken);

    // 7 & 11. ROTATION WITH GRACE PERIOD STORAGE:
    // Instead of completely deleting the old token instantly, mark it as rotated,
    // attach the newly generated tokens, and set a short expiry window (e.g., 10 seconds) for race handling.
    const gracePeriodExpiry = new Date(Date.now() + 10 * 1000); // 10 seconds grace period

    await refreshTokenRepository.updateByTokenHash(hashedIncomingToken, {
        isRevoked: true,
        replacementAccessToken: newAccessToken,
        replacementRefreshToken: newRefreshToken,
        gracePeriodUntil: gracePeriodExpiry,
    });

    // Save the HASH of the new refresh token
    await refreshTokenRepository.create({
        userId: user._id,
        tokenHash: newTokenHash,
        expiresAt: refreshTokenExpiresAt,
    });

    logger.info(`Refresh token rotated successfully: ${user._id}`);

    // 12. Return new token pair
    return {
        newAccessToken,
        newRefreshToken,
    };
};

export default RefreshTokenService;
