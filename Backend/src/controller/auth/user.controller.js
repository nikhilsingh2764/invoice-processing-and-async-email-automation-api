import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js";
import translate from "../../utils/translate.js";

import {
    accessTokenOptions,
    refreshTokenOptions
} from "../../utils/cookieOptions.js";


import {
    SignupService,
    LoginService,
    ProfileService,
    LogoutService,
    VerifyOTPService,
    UpdateProfileService,
    ForgotPasswordService,
    ResetPasswordService,
    updatePasswordService,
    DeactivateAccountService,
    DeleteAccountService
} from "../../service/auth/auth.service.js";



export const Signup = TryCatch(async (req, res) => {

    console.log("🚨 CONTROLLER VERSION 123");

        
    const data = await SignupService(
            req.body,
            req.language
        );


    return res.status(201).json(
        new ApiResponse(
            201,
            translate(
                "AUTH.OTP_SENT",
                req.language
            ),
            data
        )
    );
});



export const VerifyOTP = TryCatch(async (req, res) => {

    const data =
        await VerifyOTPService(
            req.body,
            req.language
        );


    return res.status(201).json(
        new ApiResponse(
            201,
            translate(
                "AUTH.SIGNUP_SUCCESS",
                req.language
            ),
            data
        )
    );
});



export const Login = TryCatch(async (req, res) => {

    const {
        user,
        accessToken,
        refreshToken
    } = await LoginService(
        req.body,
        req.language
    );


    // Store tokens in cookies
    res.cookie(
        "accessToken",
        accessToken,
        accessTokenOptions
    );

    res.cookie(
        "refreshToken",
        refreshToken,
        refreshTokenOptions
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "AUTH.LOGIN_SUCCESS",
                req.language
            ),
            user
        )
    );
});



export const Profile = TryCatch(async (req, res) => {

    const userId = req.user._id;


    const user =
        await ProfileService(
            userId,
            req.language
        );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "PROFILE.PROFILE_FETCHED",
                req.language
            ),
            user
        )
    );
});



export const Logout = TryCatch(async (req, res) => {

    // Get refresh token from cookie
    const refreshToken =
        req.cookies.refreshToken;


    // Remove refresh token from database
    await LogoutService(
        refreshToken,
        req.language
    );


    // Clear cookies
    res.clearCookie(
        "accessToken",
        accessTokenOptions
    );

    res.clearCookie(
        "refreshToken",
        refreshTokenOptions
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "AUTH.LOGOUT_SUCCESS",
                req.language
            )
        )
    );
});



export const UpdateProfile = TryCatch(async (req, res) => {

    const userId = req.user._id;


    const user =
        await UpdateProfileService(
            userId,
            req.body,
            req.language
        );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "PROFILE.PROFILE_UPDATED",
                req.language
            ),
            user
        )
    );
});



export const UpdatePassword = TryCatch(async (req, res) => {

    const userId = req.user._id;


    const result =
        await updatePasswordService(
            userId,
            req.body,
            req.language
        );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "AUTH.PASSWORD_UPDATED",
                req.language
            ),
            result
        )
    );
});



export const DeactivateAccount = TryCatch(async (req, res) => {

    const userId = req.user._id;


    await DeactivateAccountService(
        userId,
        req.language
    );


    // Logout user
    res.clearCookie(
        "accessToken",
        accessTokenOptions
    );

    res.clearCookie(
        "refreshToken",
        refreshTokenOptions
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "AUTH.ACCOUNT_DEACTIVATED",
                req.language
            ),
            null
        )
    );
});



export const DeleteAccount = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const { password } = req.body;


    await DeleteAccountService(
        userId,
        password,
        req.language
    );


    // Logout user
    res.clearCookie(
        "accessToken",
        accessTokenOptions
    );

    res.clearCookie(
        "refreshToken",
        refreshTokenOptions
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "AUTH.ACCOUNT_DELETED",
                req.language
            ),
            null
        )
    );
});



export const ForgotPassword = TryCatch(async (req, res) => {

    const { email } = req.body;


    await ForgotPasswordService(
        email,
        req.language
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "AUTH.FORGOT_PASSWORD_SUCCESS",
                req.language
            ),
            null
        )
    );
});



export const ResetPassword = TryCatch(async (req, res) => {

    const {
        email,
        otp,
        newPassword
    } = req.body;


    await ResetPasswordService(
        {
            email,
            otp,
            newPassword
        },
        req.language
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "AUTH.PASSWORD_RESET_SUCCESS",
                req.language
            ),
            null
        )
    );
});