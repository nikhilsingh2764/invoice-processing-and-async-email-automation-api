import jwt from "jsonwebtoken";

import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";

import ApiError from "../../utils/ApiError.js";
import userRepository from "../../repository/auth/user.repository.js";
import generateToken from "../../utils/generateToken.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";


const RefreshTokenService = async (
    refreshToken,
    language = "en"
) => {

    // 1. Check refresh token exists
    if (!refreshToken) {

        logger.warn(
            "Refresh token request failed: token missing"
        );

        throw new ApiError(
            401,
            translate(
                "AUTH.TOKEN_REQUIRED",
                language
            )
        );
    }


    // 2. Verify refresh token
    let decoded;

    try {

        decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

    } catch (error) {

        logger.warn(
            "Refresh token verification failed"
        );

        throw new ApiError(
            401,
            translate(
                "AUTH.INVALID_TOKEN",
                language
            )
        );
    }


    // 3. Check refresh token exists in database
    const storedToken =
        await refreshTokenRepository.findByToken(
            refreshToken
        );


    if (!storedToken) {

        logger.warn(
            `Refresh token revoked or expired: ${decoded.id}`
        );

        throw new ApiError(
            401,
            translate(
                "AUTH.TOKEN_EXPIRED",
                language
            )
        );
    }


    // 4. Find user
    const user =
        await userRepository.findById(decoded.id);


    if (!user) {

        logger.warn(
            `Refresh token used for unknown user: ${decoded.id}`
        );

        throw new ApiError(
            401,
            translate(
                "AUTH.USER_NOT_FOUND",
                language
            )
        );
    }


    // 5. Check account status
    if (!user.isActive) {

        logger.warn(
            `Refresh token used for inactive account: ${user._id}`
        );

        throw new ApiError(
            403,
            translate(
                "AUTH.ACCOUNT_INACTIVE",
                language
            )
        );
    }


    // 6. Delete old refresh token
    await refreshTokenRepository.deleteByToken(
        refreshToken
    );


    // 7. Generate new access token
    const newAccessToken =
        generateToken(
            {
                id: user._id,
                email: user.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_EXPIRES_IN
        );


    // 8. Generate new refresh token
    const newRefreshToken =
        generateToken(
            {
                id: user._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            process.env.REFRESH_TOKEN_EXPIRES_IN
        );


    // 9. Calculate refresh token expiry
    const refreshTokenExpiresAt =
        new Date(
            Date.now() +
            15 * 24 * 60 * 60 * 1000
        );


    // 10. Save new refresh token
    await refreshTokenRepository.create({

        userId: user._id,

        token: newRefreshToken,

        expiresAt: refreshTokenExpiresAt

    });


    logger.info(
        `Refresh token rotated successfully: ${user._id}`
    );


    // 11. Return new token pair
    return {

        newAccessToken,

        newRefreshToken

    };

};


export default RefreshTokenService;