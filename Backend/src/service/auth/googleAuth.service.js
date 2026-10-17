import userRepository from "../../repository/auth/user.repository.js";
import generateToken from "../../utils/generateToken.js";
import { verifyGoogleToken } from "../../utils/googleVerify.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";
import ApiError from "../../utils/ApiError.js";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";


export const googleLoginService = async (idToken, language = "en") => {

    // Verify Google ID Token
    const googleUser = await verifyGoogleToken(idToken);

    //  Map username from the verification result
    const username = googleUser.username || googleUser.name;

    // Check if the user already exists by email
    let user = await userRepository.findByEmailWithoutPassword(
        googleUser.email
    );

    //Check if the user exists and whether their account is active
    if (user && !user.isActive) {
        logger.warn(`Google login attempted on deactivated account: ${user.email}`);
        throw new ApiError(
            403,
            translate("AUTH.ACCOUNT_DEACTIVATED", language) // or pass a raw string like "Account is deactivated"
        );
    }


    // Create Google account if first time
    if (!user) {

        user = await userRepository.create({

            username: googleUser.name,

            email: googleUser.email,

            provider: "GOOGLE",

            googleId: googleUser.googleId,

            isVerified: true

        });

    }


    // Existing LOCAL user login with Google
    else if (user.provider === "LOCAL") {

        throw new ApiError(400, "An account already exists with this email. Please login using your password.");

    }


    // Generate Access Token

    const accessToken = generateToken(
        {
            id: user._id,
            email: user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRES_IN
    );


    // Generate Refresh Token

    const refreshToken = generateToken(
        {
            id: user._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_EXPIRES_IN
    );

    await refreshTokenRepository.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
        )
    });


    return {
        accessToken,
        refreshToken,
        user
    };

};