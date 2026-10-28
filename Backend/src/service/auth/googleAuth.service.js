import crypto from "crypto";
import userRepository from "../../repository/auth/user.repository.js";
import { issueTokenPair } from "../../utils/tokens.js";
import { verifyGoogleToken } from "../../utils/googleVerify.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";
import ApiError from "../../utils/ApiError.js";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";

// Builds a username that satisfies the schema (3-30 chars, letters/numbers/underscore)
// and is not taken yet. Google display names often contain spaces or collide.
const buildUniqueUsername = async (displayName, email) => {
    let base = String(displayName || email.split("@")[0] || "user")
        .replace(/[^A-Za-z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 24);

    if (base.length < 3) base = `${base}user`.slice(0, 24);

    let candidate = base;

    while (await userRepository.usernameExist(candidate)) {
        candidate = `${base}_${crypto.randomInt(1000, 10000)}`;
    }

    return candidate;
};

export const googleLoginService = async (idToken, language = "en") => {
    // Verify Google ID Token (throws ApiError 401/503 on failure)
    const googleUser = await verifyGoogleToken(idToken);

    // Check if the user already exists by email
    let user = await userRepository.findByEmailWithoutPassword(googleUser.email);

    //Check if the user exists and whether their account is active
    if (user && !user.isActive) {
        logger.warn(`Google login attempted on deactivated account: ${user.email}`);
        throw new ApiError(403, translate("AUTH.ACCOUNT_DEACTIVATED", language));
    }

    // Create Google account if first time
    if (!user) {
        user = await userRepository.create({
            username: await buildUniqueUsername(googleUser.username, googleUser.email),

            email: googleUser.email,

            provider: "GOOGLE",

            googleId: googleUser.googleId,

            isVerified: true,
        });
    }

    // Existing LOCAL user login with Google
    else if (user.provider === "LOCAL") {
        throw new ApiError(
            400,
            "An account already exists with this email. Please login using your password."
        );
    }

    const { accessToken, refreshToken, refreshTokenHash, refreshTokenExpiresAt } =
        issueTokenPair(user);

    await refreshTokenRepository.create({
        userId: user._id,
        tokenHash: refreshTokenHash,
        expiresAt: refreshTokenExpiresAt,
    });

    return {
        accessToken,
        refreshToken,
        // Public fields only
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
            provider: user.provider,
        },
    };
};
