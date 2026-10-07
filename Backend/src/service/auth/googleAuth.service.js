import userRepository from "../../repository/auth/user.repository.js";
import generateToken from "../../utils/generateToken.js";
import { verifyGoogleToken } from "../../utils/googleVerify.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";
import ApiError from "../../utils/ApiError.js";


export const googleLoginService = async (idToken) => {

    // Verify Google ID Token
    const googleUser = await verifyGoogleToken(idToken);


    // Check existing user
    let user = await userRepository.findByEmailWithoutPassword(
        googleUser.email
    );


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

    throw new ApiError(400,"An account already exists with this email. Please login using your password.");

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