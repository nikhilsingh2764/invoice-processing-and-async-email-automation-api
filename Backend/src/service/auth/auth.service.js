import ApiError from '../../utils/ApiError.js';
import bcrypt from 'bcrypt';
import redis from "../../config/redis.js";

import userRepository from '../../repository/auth/user.repository.js';
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";

import sendEmail from "./email.service.js";
import sendOTPService from "./otp.service.js";

import generateToken from "../../utils/generateToken.js";

import welcomeTemplate from "../../templates/welcome.template.js";

import translate from '../../utils/translate.js';
import logger from '../../utils/logger.js';


const SALT_ROUNDS = 10;


// =========================
// SIGNUP
// =========================

export const SignupService = async (userdata, language = "en") => {

    console.log("start email seininf");
    

    let { username, email, password } = userdata;

    // Sanitize data
    username = username.trim();
    email = email.trim().toLowerCase();


    // Check email exists
    const emailExist = await userRepository.emailExist(email);

    if (emailExist) {
        throw new ApiError(
            409,
            translate("AUTH.EMAIL_ALREADY_EXISTS", language)
        );
    }


    // Check username exists
    const usernameExist = await userRepository.usernameExist(username);

    if (usernameExist) {
        throw new ApiError(
            409,
            translate("AUTH.USERNAME_ALREADY_EXISTS", language)
        );
    }

    console.log("email");



    // Generate OTP, save signup data and queue email
    console.log("🔥 1 - BEFORE sendOTPService");

    await sendOTPService({
        username,
        email,
        password,
        type: "EMAIL_VERIFICATION"
    });

    console.log("🔥 2 - AFTER sendOTPService");


    logger.info(
        `Signup OTP generated and email queued for: ${email}`
    );


    return {
        email
    };
};


// =========================
// VERIFY OTP
// =========================

export const VerifyOTPService = async ({ email, otp }, language = "en") => {

    email = email.trim().toLowerCase();

    const key = `otp:EMAIL_VERIFICATION:${email}`;

    const data = await redis.get(key);


    if (!data) {
        throw new ApiError(
            400,
            translate("AUTH.OTP_EXPIRED", language)
        );
    }


    const otpData = JSON.parse(data);


    // Verify OTP
    if (otpData.otp !== String(otp)) {

        logger.warn(
            `Invalid email verification OTP attempt: ${email}`
        );

        throw new ApiError(
            400,
            translate("AUTH.INVALID_OTP", language)
        );
    }


    // Create user
    const user = await userRepository.create({
        email: otpData.email,
        username: otpData.username,
        password: otpData.password,
        isVerified: true
    });


    logger.info(
        `User created successfully: ${user._id}`
    );


    // Delete OTP
    await redis.del(key);


    // Send welcome email
    await sendEmail({
        to: user.email,
        subject: "Successful verification",
        html: welcomeTemplate(user.username)
    });


    return user;
};


// =========================
// LOGIN
// =========================

export const LoginService = async (userdata, language = "en") => {

    let { email, password } = userdata;

    // Sanitize email
    email = email.trim().toLowerCase();


    // Find user
    const user = await userRepository.findByEmail(email);


    if (!user) {

        logger.warn(
            `Login failed - user not found: ${email}`
        );

        throw new ApiError(
            400,
            translate("AUTH.INVALID_PASSWORD", language)
        );
    }


    // Check email verification
    if (!user.isVerified) {

        logger.warn(
            `Login attempted with unverified account: ${email}`
        );

        throw new ApiError(
            400,
            translate("AUTH.EMAIL_NOT_VERIFIED", language)
        );
    }


    // Check account active
    if (!user.isActive) {

        logger.warn(
            `Login attempted with inactive account: ${user._id}`
        );

        throw new ApiError(
            400,
            translate("AUTH.ACCOUNT_INACTIVE", language)
        );
    }


    // Compare password
    const isPasswordMatch = await bcrypt.compare(
        password,
        user.password
    );


    // Wrong password
    if (!isPasswordMatch) {

        user.failedLoginAttempts += 1;


        // Lock account after 5 failed attempts
        if (user.failedLoginAttempts >= 5) {

            user.lockUntil =
                new Date(
                    Date.now() + 15 * 60 * 1000
                );
        }


        await userRepository.updateProfile(
            user._id,
            {
                failedLoginAttempts: user.failedLoginAttempts,
                lockUntil: user.lockUntil
            }
        );


        logger.warn(
            `Login failed - incorrect password: ${user._id}`
        );


        throw new ApiError(
            400,
            translate("AUTH.INVALID_PASSWORD", language)
        );
    }


    // Reset failed attempts
    if (
        user.failedLoginAttempts > 0 ||
        user.lockUntil
    ) {

        await userRepository.updateProfile(
            user._id,
            {
                failedLoginAttempts: 0,
                lockUntil: null
            }
        );
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


    // NEVER console.log tokens
    await refreshTokenRepository.create({

        userId: user._id,

        token: refreshToken,

        expiresAt: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
        )
    });


    logger.info(
        `User logged in successfully: ${user._id}`
    );


    return {

        user: {
            email: user.email,
            username: user.username,
            id: user._id
        },

        accessToken,

        refreshToken
    };
};


// =========================
// PROFILE
// =========================

export const ProfileService = async (
    userId,
    language = "en"
) => {

    const cachekey = `profile:${userId}`;

    const cacheProfile = await redis.get(cachekey);


    if (cacheProfile) {

        logger.info(
            `Profile cache hit: ${userId}`
        );

        return JSON.parse(cacheProfile);
    }


    logger.info(
        `Profile cache miss: ${userId}`
    );


    const user = await userRepository.findById(userId);


    if (!user) {

        logger.warn(
            `Profile not found: ${userId}`
        );

        throw new ApiError(
            404,
            translate("AUTH.USER_NOT_FOUND", language)
        );
    }


    const profile = {

        id: user._id,

        username: user.username,

        email: user.email,

        isVerified: user.isVerified,

        isActive: user.isActive,

        createdAt: user.createdAt,

        updatedAt: user.updatedAt
    };


    await redis.set(
        cachekey,
        JSON.stringify(profile),
        'EX',
        300
    );


    logger.info(
        `Profile fetched from database and cached: ${userId}`
    );


    return profile;
};


// =========================
// LOGOUT
// =========================

export const LogoutService = async (
    refreshToken,
    language = "en"
) => {

    if (refreshToken) {

        await refreshTokenRepository.deleteByToken(
            refreshToken
        );
    }


    logger.info(
        `User logged out successfully`
    );


    return null;
};


// =========================
// UPDATE PROFILE
// =========================

export const UpdateProfileService = async (
    userId,
    data,
    language = "en"
) => {

    const { username } = data;


    if (username) {

        const existingUser =
            await userRepository.findByUsername(username);


        if (
            existingUser &&
            existingUser._id.toString() !== userId.toString()
        ) {

            throw new ApiError(
                400,
                translate(
                    "AUTH.USERNAME_ALREADY_EXISTS",
                    language
                )
            );
        }
    }


    const updatedUser =
        await userRepository.updateProfile(
            userId,
            {
                username
            }
        );


    if (!updatedUser) {

        throw new ApiError(
            404,
            translate(
                "AUTH.USER_NOT_FOUND",
                language
            )
        );
    }


    // Remove old Redis cache
    await redis.del(
        `profile:${userId}`
    );


    logger.info(
        `User profile updated successfully: ${userId}`
    );


    return {

        id: updatedUser._id,

        username: updatedUser.username,

        email: updatedUser.email,

        isVerified: updatedUser.isVerified,

        isActive: updatedUser.isActive,

        createdAt: updatedUser.createdAt,

        updatedAt: updatedUser.updatedAt
    };
};


// =========================
// FORGOT PASSWORD
// =========================

export const ForgotPasswordService = async (
    email,
    language = "en"
) => {

    email = email.trim().toLowerCase();


    const user =
        await userRepository.findByEmailWithoutPassword(email);


    if (!user) {

        logger.warn(
            `Password reset requested for unknown email: ${email}`
        );

        throw new ApiError(
            404,
            translate(
                "AUTH.USER_NOT_FOUND",
                language
            )
        );
    }


    if (user.provider === "GOOGLE") {

        logger.warn(
            `Password reset attempted for Google account: ${user._id}`
        );

        throw new ApiError(
            400,
            translate(
                "AUTH.GOOGLE_PASSWORD_RESET",
                language
            )
        );
    }


    await sendOTPService({

        email: user.email,

        type: "PASSWORD_RESET"
    });


    logger.info(
        `Password reset OTP queued: ${email}`
    );


    return null;
};


// =========================
// RESET PASSWORD
// =========================

export const ResetPasswordService = async (
    { email, otp, newPassword },
    language = "en"
) => {

    if (!email || !otp || !newPassword) {

        throw new ApiError(
            400,
            translate(
                "AUTH.PASSWORDS_REQUIRED",
                language
            )
        );
    }


    email = email.trim().toLowerCase();


    const user =
        await userRepository.findByEmailWithoutPassword(email);


    if (!user) {

        logger.warn(
            `Password reset attempted for unknown email: ${email}`
        );

        throw new ApiError(
            404,
            translate(
                "AUTH.USER_NOT_FOUND",
                language
            )
        );
    }


    if (user.provider === "GOOGLE") {

        logger.warn(
            `Password reset attempted for Google account: ${user._id}`
        );

        throw new ApiError(
            400,
            translate(
                "AUTH.GOOGLE_PASSWORD_RESET",
                language
            )
        );
    }


    const key =
        `otp:PASSWORD_RESET:${email}`;


    const data =
        await redis.get(key);


    if (!data) {

        logger.warn(
            `Password reset OTP expired or not found: ${user._id}`
        );

        throw new ApiError(
            400,
            translate(
                "AUTH.INVALID_OTP",
                language
            )
        );
    }


    const otpdata =
        JSON.parse(data);


    if (
        otpdata.otp !== String(otp)
    ) {

        logger.warn(
            `Invalid password reset OTP attempt: ${user._id}`
        );

        throw new ApiError(
            400,
            translate(
                "AUTH.INVALID_OTP",
                language
            )
        );
    }


    const hashedNewPassword =
        await bcrypt.hash(
            newPassword,
            SALT_ROUNDS
        );


    await userRepository.updateProfile(
        user._id,
        {
            password: hashedNewPassword
        }
    );


    await redis.del(key);


    logger.info(
        `Password reset successfully: ${user._id}`
    );


    return null;
};


// =========================
// UPDATE PASSWORD
// =========================

export const updatePasswordService = async (
    id,
    data,
    language = "en"
) => {

    const {
        oldPassword,
        newPassword
    } = data;


    if (
        !newPassword ||
        !oldPassword
    ) {

        throw new ApiError(
            400,
            translate(
                "AUTH.PASSWORDS_REQUIRED",
                language
            )
        );
    }


    const user =
        await userRepository.findByIdWithPassword(id);


    if (!user) {

        logger.warn(
            `Password update attempted for unknown user: ${id}`
        );

        throw new ApiError(
            400,
            translate(
                "AUTH.USER_NOT_FOUND",
                language
            )
        );
    }


    const isPasswordCorrect =
        await bcrypt.compare(
            oldPassword,
            user.password
        );


    if (!isPasswordCorrect) {

        logger.warn(
            `Incorrect old password during password update: ${id}`
        );

        throw new ApiError(
            401,
            translate(
                "AUTH.OLD_PASSWORD_INCORRECT",
                language
            )
        );
    }


    const newHashedPassword =
        await bcrypt.hash(
            newPassword,
            SALT_ROUNDS
        );


    await userRepository.updateProfile(
        id,
        {
            password: newHashedPassword
        }
    );


    logger.info(
        `Password updated successfully: ${id}`
    );


    return null;
};


// =========================
// DEACTIVATE ACCOUNT
// =========================

export const DeactivateAccountService = async (
    id,
    language = "en"
) => {

    const user =
        await userRepository.findById(id);


    if (!user) {

        logger.warn(
            `Account deactivation attempted for unknown user: ${id}`
        );

        throw new ApiError(
            404,
            translate(
                "AUTH.USER_NOT_FOUND",
                language
            )
        );
    }


    if (!user.isActive) {

        logger.warn(
            `Account already deactivated: ${id}`
        );

        throw new ApiError(
            400,
            translate(
                "AUTH.ACCOUNT_ALREADY_DEACTIVATED",
                language
            )
        );
    }


    await userRepository.deactivateAccount(id);


    logger.info(
        `Account deactivated successfully: ${id}`
    );


    return null;
};


// =========================
// DELETE ACCOUNT
// =========================

export const DeleteAccountService = async (
    id,
    password,
    language = "en"
) => {

    if (!password) {

        throw new ApiError(
            400,
            translate(
                "AUTH.PASSWORD_REQUIRED",
                language
            )
        );
    }


    const user =
        await userRepository.findByIdWithPassword(id);


    if (!user) {

        logger.warn(
            `Account deletion attempted for unknown user: ${id}`
        );

        throw new ApiError(
            400,
            translate(
                "AUTH.USER_NOT_FOUND",
                language
            )
        );
    }


    const isPasswordCorrect =
        await bcrypt.compare(
            password,
            user.password
        );


    if (!isPasswordCorrect) {

        logger.warn(
            `Invalid password during account deletion: ${id}`
        );

        throw new ApiError(
            401,
            translate(
                "AUTH.INVALID_PASSWORD",
                language
            )
        );
    }


    await userRepository.findByIdAndDelete(id);


    await redis.del(
        `profile:${id}`
    );


    logger.info(
        `Account deleted successfully: ${id}`
    );


    return null;
};