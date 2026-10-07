import { googleLoginService } from "../../service/auth/googleAuth.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import TryCatch from "../../middleware/TryCatch.js";
import translate from "../../utils/translate.js";

export const googleLoginController = TryCatch(async (req, res) => {

    const { idToken } = req.body;

    const result = await googleLoginService(
        idToken,
        req.language
    );


    res.cookie(
        "accessToken",
        result.accessToken,
        {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }
    );


    res.cookie(
        "refreshToken",
        result.refreshToken,
        {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "AUTH.GOOGLE_LOGIN_SUCCESS",
                req.language
            ),
            result.user
        )
    );

});