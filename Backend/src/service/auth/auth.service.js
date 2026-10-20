import ApiError from "../../utils/ApiError.js";
import bcrypt from "bcrypt";
import redis from "../../config/redis.js";

import userRepository from "../../repository/auth/user.repository.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";

import { emailQueue } from "../../queues/email.queue.js";
import sendOTPService from "./otp.service.js";

import generateToken from "../../utils/generateToken.js";

import welcomeTemplate from "../../templates/welcome.template.js";

import translate from "../../utils/translate.js";
import logger from "../../utils/logger.js";
import hashToken from "../../utils/hashToken.js";


import Business from "../../model/invoice/Business.model.js";
import Customer from "../../model/invoice/customer.model.js";
import Product from "../../model/invoice/product.model.js";
import Invoice from "../../model/invoice/invoice.model.js";

import mongoose from "mongoose";

const SALT_ROUNDS = 10;

// =========================
// SIGNUP
// =========================

export const SignupService = async (userdata, language = "en") => {
    let { username, email, password } = userdata;

    // Sanitize data
    username = username.trim();
    email = email.trim().toLowerCase();

    // Check email exists
    const emailExist = await userRepository.emailExist(email);

    if (emailExist) {
        logger.info(`Signup attempted with existing email (generic response returned): ${email}`);
        return {
            email,
        };
    }

    // Check username exists
    const usernameExist = await userRepository.usernameExist(username);

    if (usernameExist) {
        logger.info(`Signup attempted with existing username (generic response returned): ${username}`);
        // Return a generic success-like structure to prevent account/username enumeration
        return {
            email,
        };
    }

    await sendOTPService({
        username,
        email,
        password,
        type: "EMAIL_VERIFICATION",
    });

    logger.info(`Signup OTP generated and email queued for: ${email}`);

    return {
        email,
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
        throw new ApiError(400, translate("AUTH.OTP_EXPIRED", language));
    }

    const otpData = JSON.parse(data);

    if (typeof otpData.attempts !== "number") {
        otpData.attempts = 0;
    }

    if (otpData.attempts >= 5) {
        await redis.del(key);
        logger.warn(`OTP blocked due to max failed attempts for: ${email}`);
        throw new ApiError(
            400,
            translate("AUTH.OTP_LOCKED", language) ||
            "Too many failed attempts. OTP has been invalidated."
        );
    }

    const isMatch = await bcrypt.compare(String(otp), otpData.otp);

    if (!isMatch) {
        otpData.attempts += 1;

        if (otpData.attempts >= 5) {
            await redis.del(key);
            logger.warn(`OTP invalidated after 5 failed attempts for: ${email}`);
            throw new ApiError(
                400,
                translate("AUTH.OTP_LOCKED", language) ||
                "Too many failed attempts. OTP has been invalidated."
            );
        } else {
            await redis.set(key, JSON.stringify(otpData), "KEEPTTL");
        }

        logger.warn(`Invalid email verification OTP attempt (${otpData.attempts}/5): ${email}`);
        throw new ApiError(400, translate("AUTH.INVALID_OTP", language));
    }

    const user = await userRepository.create({
        email: otpData.email,
        username: otpData.username,
        password: otpData.password,
        isVerified: true,
    });

    logger.info(`User created successfully: ${user._id}`);

    await redis.del(key);

    try {
        await emailQueue.add(
            "send-email",
            {
                to: user.email,
                subject: translate("AUTH.WELCOME_SUBJECT", language) || "Successful verification",
                html: welcomeTemplate(user.username),
                language,
            },
            {
                jobId: `welcome-${user._id}`,
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                },
            }
        );
    } catch (err) {
        logger.error(`Failed to queue welcome email for user ${user._id}: ${err.message}`);
    }

    return user;
};

// =========================
// LOGIN
// =========================


export const LoginService = async (userdata, language = "en") => {
    let { email, password } = userdata;
    email = email.trim().toLowerCase();

    const user = await userRepository.findByEmail(email);

    // 1. Mitigate timing attacks: Always execute bcrypt.compare even if user doesn't exist
    const dummyHash = "$2b$10$abcdefghijklmnopqrstuABCDEFGHIJKLMNOPQRSTUVWXYZ0123456";
    const passwordHashToCompare = user ? user.password : dummyHash;
    const isPasswordMatch = await bcrypt.compare(password, passwordHashToCompare);

    // 2. Prevent account enumeration: Use generic unified checks where possible,
    // or perform all validation silently without giving away distinct state clues.
    if (!user) {
        logger.warn(`Login failed - user not found: ${email}`);
        throw new ApiError(400, translate("AUTH.INVALID_PASSWORD", language));
    }

    if (user.provider === "GOOGLE") {
        throw new ApiError(400, "Google accounts cannot use password authentication");
    }

    if (!user.isVerified || !isPasswordMatch) {
        logger.warn(`Login failed - unverified account or incorrect password: ${email}`);
        throw new ApiError(400, translate("AUTH.INVALID_PASSWORD", language));
    }

    if (!user.isActive) {
        logger.warn(`Login attempted with inactive account: ${user._id}`);
        throw new ApiError(400, translate("AUTH.ACCOUNT_INACTIVE", language));
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
        logger.warn(`Account temporarily locked: ${email}`);
        throw new ApiError(429, translate("AUTH.ACCOUNT_LOCKED", language));
    }

    if (user.lockUntil && user.lockUntil <= new Date()) {

        await userRepository.updateProfile(user._id, {
            failedLoginAttempts: 0,
            lockUntil: null,
        });

        user.failedLoginAttempts = 0;
        user.lockUntil = null;

    }


    if (!user.isVerified || !isPasswordMatch) {
        logger.warn(`Login failed - unverified account or incorrect password: ${email}`);

        // 2. ATOMIC UPDATE: Increment failed attempts and lock account atomically 
        // to prevent read-modify-write race conditions and denial-of-service vectors.
        const currentAttempts = (user.failedLoginAttempts || 0) + 1;
        const updateData = {
            failedLoginAttempts: currentAttempts,
        };

        if (currentAttempts >= 5) {
            updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }

        await userRepository.updateProfile(user._id, updateData);

        throw new ApiError(400, translate("AUTH.INVALID_PASSWORD", language));
    }

    if (user.failedLoginAttempts > 0 || user.lockUntil) {
        await userRepository.updateProfile(user._id, {
            failedLoginAttempts: 0,
            lockUntil: null,
        });
    }

    const accessToken = generateToken(
        { id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRES_IN
    );

    const refreshToken = generateToken(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_EXPIRES_IN
    );

    await refreshTokenRepository.create({
        userId: user._id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    logger.info(`User logged in successfully: ${user._id}`);

    return {
        user: {
            email: user.email,
            username: user.username,
            id: user._id,
        },
        accessToken,
        refreshToken,
    };
};

// =========================
// PROFILE
// =========================

export const ProfileService = async (userId, language = "en") => {
    const cachekey = `profile:${userId}`;
    const cacheProfile = await redis.get(cachekey);

    if (cacheProfile) {
        logger.info(`Profile cache hit: ${userId}`);
        return JSON.parse(cacheProfile);
    }

    logger.info(`Profile cache miss: ${userId}`);

    const user = await userRepository.findById(userId);

    if (!user) {
        logger.warn(`Profile not found: ${userId}`);
        throw new ApiError(404, translate("AUTH.USER_NOT_FOUND", language));
    }

    const profile = {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    await redis.set(cachekey, JSON.stringify(profile), "EX", 300);

    logger.info(`Profile fetched from database and cached: ${userId}`);

    return profile;
};

// =========================
// LOGOUT
// =========================

export const LogoutService = async (refreshToken, language = "en") => {
    if (refreshToken) {
        await refreshTokenRepository.deleteByToken(refreshToken);
    }

    logger.info(`User logged out successfully`);
    return null;
};

// =========================
// UPDATE PROFILE
// =========================

export const UpdateProfileService = async (userId, data, language = "en") => {
    const { username } = data;

    if (username) {
        const existingUser = await userRepository.findByUsername(username);

        if (existingUser && existingUser._id.toString() !== userId.toString()) {
            throw new ApiError(400, translate("AUTH.USERNAME_ALREADY_EXISTS", language));
        }
    }

    const updatedUser = await userRepository.updateProfile(userId, { username });

    if (!updatedUser) {
        throw new ApiError(404, translate("AUTH.USER_NOT_FOUND", language));
    }

    await redis.del(`profile:${userId}`);

    logger.info(`User profile updated successfully: ${userId}`);

    return {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
    };
};

// =========================
// FORGOT PASSWORD
// =========================

export const ForgotPasswordService = async (email, language = "en") => {

    email = email.trim().toLowerCase();

    const user = await userRepository.findByEmailWithoutPassword(email);

    if (!user) {
        logger.warn(
            `Password reset requested for unknown email (generic response returned): ${email}`
        );
        // Return generic success response (null) to prevent account enumeration
        return null;
    }

    if (user.provider === "GOOGLE") {
        logger.warn(`Password reset attempted for Google account: ${user._id}`);
        throw new ApiError(400, translate("AUTH.GOOGLE_PASSWORD_RESET", language));
    }

    await sendOTPService({
        email: user.email,
        type: "PASSWORD_RESET",
    });

    logger.info(`Password reset OTP queued: ${email}`);

    return null;
};

// =========================
// RESET PASSWORD
// =========================

export const ResetPasswordService = async ({ email, otp, newPassword }, language = "en") => {

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, translate("AUTH.PASSWORDS_REQUIRED", language));
    }

    email = email.trim().toLowerCase();

    const user = await userRepository.findByEmailWithoutPassword(email);

    if (!user) {
        logger.warn(`Password reset attempted for unknown email: ${email}`);

        // Dummy bcrypt comparison to prevent timing side-channel attacks
        const dummyHash = "$2b$10$abcdefghijklmnopqrstuABCDEFGHIJKLMNOPQRSTUVWXYZ0123456";
        await bcrypt.compare(String(otp), dummyHash);

        throw new ApiError(400, translate("AUTH.INVALID_OTP", language));
    }

    if (user.provider === "GOOGLE") {
        logger.warn(`Password reset attempted for Google account: ${user._id}`);
        throw new ApiError(400, translate("AUTH.GOOGLE_PASSWORD_RESET", language));
    }

    const key = `otp:PASSWORD_RESET:${email}`;
    const data = await redis.get(key);

    if (!data) {
        logger.warn(`Password reset OTP expired or not found: ${user._id}`);
        throw new ApiError(400, translate("AUTH.INVALID_OTP", language));
    }

    const otpData = JSON.parse(data);

    if (typeof otpData.attempts !== "number") {
        otpData.attempts = 0;
    }

    if (otpData.attempts >= 5) {
        await redis.del(key);
        logger.warn(`Password reset OTP blocked due to max failed attempts for: ${email}`);
        throw new ApiError(
            400,
            translate("AUTH.OTP_LOCKED", language) ||
            "Too many failed attempts. OTP has been invalidated."
        );
    }

    const isMatch = await bcrypt.compare(String(otp), otpData.otp);

    if (!isMatch) {
        otpData.attempts += 1;

        if (otpData.attempts >= 5) {
            await redis.del(key);
            logger.warn(`Password reset OTP invalidated after 5 failed attempts for: ${email}`);
            throw new ApiError(
                400,
                translate("AUTH.OTP_LOCKED", language) ||
                "Too many failed attempts. OTP has been invalidated."
            );
        } else {
            await redis.set(key, JSON.stringify(otpData), "KEEPTTL");
        }

        logger.warn(`Invalid password reset OTP attempt (${otpData.attempts}/5): ${user._id}`);
        throw new ApiError(400, translate("AUTH.INVALID_OTP", language));
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await userRepository.updateProfile(user._id, {
        password: hashedNewPassword,
    });

    await redis.del(key);

    // Revoke all existing sessions/refresh tokens
    await refreshTokenRepository.deleteByUserId(user._id);

    logger.info(`Password reset successfully: ${user._id}`);

    return null;
};

// =========================
// UPDATE PASSWORD
// =========================

export const updatePasswordService = async (id, data, language = "en") => {
    const { oldPassword, newPassword } = data;

    if (!newPassword || !oldPassword) {
        throw new ApiError(400, translate("AUTH.PASSWORDS_REQUIRED", language));
    }

    const user = await userRepository.findByIdWithPassword(id);

    if (!user) {
        logger.warn(`Password update attempted for unknown user: ${id}`);
        throw new ApiError(400, translate("AUTH.USER_NOT_FOUND", language));
    }

    if (user.provider === "GOOGLE") {
        throw new ApiError(400, "Google accounts cannot use password authentication");
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
        logger.warn(`Incorrect old password during password update: ${id}`);
        throw new ApiError(401, translate("AUTH.OLD_PASSWORD_INCORRECT", language));
    }

    const newHashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await userRepository.updateProfile(id, {
        password: newHashedPassword,
    });

    // Revoke all existing sessions/refresh tokens
    await refreshTokenRepository.deleteByUserId(id);

    logger.info(`Password updated successfully: ${id}`);

    return null;
};

// =========================
// DEACTIVATE ACCOUNT
// =========================

export const DeactivateAccountService = async (id, language = "en") => {
    const user = await userRepository.findById(id);

    if (!user) {
        logger.warn(`Account deactivation attempted for unknown user: ${id}`);
        throw new ApiError(404, translate("AUTH.USER_NOT_FOUND", language));
    }

    if (!user.isActive) {
        logger.warn(`Account already deactivated: ${id}`);
        throw new ApiError(400, translate("AUTH.ACCOUNT_ALREADY_DEACTIVATED", language));
    }

    await userRepository.deactivateAccount(id);

    // Revoke all existing sessions/refresh tokens
    await refreshTokenRepository.deleteByUserId(id);

    logger.info(`Account deactivated successfully: ${id}`);

    return null;
};

// =========================
// DELETE ACCOUNT
// =========================

export const DeleteAccountService = async (id, password, language = "en") => {
    const user = await userRepository.findByIdWithPassword(id);

    if (!user) {
        logger.warn(`Account deletion attempted for unknown user: ${id}`);
        throw new ApiError(404, translate("AUTH.USER_NOT_FOUND", language));
    }

    if (user.provider === "GOOGLE") {
        throw new ApiError(400, "Google accounts cannot use password authentication");
    }

    if (!password) {
        throw new ApiError(400, translate("AUTH.PASSWORD_REQUIRED", language));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        logger.warn(`Invalid password during account deletion: ${id}`);
        throw new ApiError(401, translate("AUTH.INVALID_PASSWORD", language));
    }

    // Start a Mongoose session for transactional atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Perform all deletions within the session
        await userRepository.findByIdAndDelete(id, { session });
        await refreshTokenRepository.deleteByUserId(id, { session });

        await Business.deleteMany({ $or: [{ userId: id }, { user: id }] }).session(session);
        await Customer.deleteMany({ $or: [{ userId: id }, { user: id }] }).session(session);
        await Product.deleteMany({ $or: [{ userId: id }, { user: id }] }).session(session);
        await Invoice.deleteMany({ $or: [{ userId: id }, { user: id }] }).session(session);

        // Commit transaction if everything succeeds
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        // Abort transaction and rollback if anything fails
        await session.abortTransaction();
        session.endSession();

        logger.error(`Account deletion failed for user ${id}: ${error.message}`);
        throw new ApiError(500, translate("COMMON.INTERNAL_ERROR", language));
    }

    await redis.del(`profile:${id}`);

    logger.info(`Account deleted successfully: ${id}`);

    return null;
};