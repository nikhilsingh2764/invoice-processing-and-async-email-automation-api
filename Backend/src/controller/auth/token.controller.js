import TryCatch from "../../middleware/TryCatch.js";
import RefreshTokenService from "../../service/auth/refreshToken.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import translate from "../../utils/translate.js";

import {
    accessTokenOptions,
    refreshTokenOptions
} from "../../utils/cookieOptions.js";



export const RefreshToken = TryCatch(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;


    const { newAccessToken, newRefreshToken } = await RefreshTokenService(
        refreshToken,
        req.language
    );


    res.cookie(
        "accessToken",
        newAccessToken,
        accessTokenOptions
    );


    res.cookie(
        "refreshToken",
        newRefreshToken,
        refreshTokenOptions
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "AUTH.TOKEN_REFRESHED",
                req.language
            ),
            null
        )
    );
});