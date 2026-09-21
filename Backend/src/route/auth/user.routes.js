import express from 'express';
import validate from '../../middleware/validate.js';
import authMiddleware from '../../middleware/auth.middleware.js';

import { googleLoginController } from '../../controller/auth/googleAuth.controller.js';

import {
    Signup, 
    DeactivateAccount, 
    ForgotPassword, 
    ResetPassword, 
    VerifyOTP,
    DeleteAccount, 
    Login, 
    Profile, 
    Logout, 
    UpdateProfile, 
    UpdatePassword
} from '../../controller/auth/user.controller.js';

import {
    signupValidator, 
    verifyOtpValidator, 
    LoginValidator, 
    updateProfileValidator,
    changePasswordValidator, 
    forgotPasswordValidator, 
    resetPasswordValidator
} from '../../validators/auth.validator.js';

import {
    apiLimiter, 
    forgotPasswordLimiter, 
    verifyOtpLimiter,
    signupLimiter, 
    loginLimiter
} from '../../middleware/rateLimiter.middleware.js';


const router = express.Router();

/** 
 * @swagger 
 * tags: 
 * - name: Authentication 
 * description: User authentication and account management 
 */



/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends a 6-digit OTP to the registered email address.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: "^[A-Za-z0-9_]+$"
 *                 description: Unique username. Only letters, numbers and underscores are allowed.
 *                 example: Nikhil_123
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *                 example: nikhil@example.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Must contain uppercase, lowercase, number and special character.
 *                 example: Password123@
 *
 *     responses:
 *       201:
 *         description: OTP sent successfully
 *
 *       400:
 *         description: Validation error
 *
 *       409:
 *         description: User already exists
 *
 *       500:
 *         description: Internal server error
 */



router.post(
    "/signup",

    (req, res, next) => {
        console.log("🔥 1 ROUTE REACHED");
        next();
    },

    signupLimiter,

    (req, res, next) => {
        console.log("🔥 2 LIMITER PASSED");
        next();
    },

    signupValidator,

    (req, res, next) => {
        console.log("🔥 3 VALIDATOR PASSED");
        next();
    },

    validate,

    (req, res, next) => {
        console.log("🔥 4 VALIDATE PASSED");
        next();
    },

    Signup
);






/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify email OTP
 *     description: Verifies the 6-digit OTP sent during user registration and completes email verification.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nikhil@example.com
 *
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 pattern: "^[0-9]{6}$"
 *                 description: 6-digit OTP received by email.
 *                 example: "123456"
 *
 *     responses:
 *       201:
 *         description: Email verified and signup completed successfully
 *
 *       400:
 *         description: Invalid or expired OTP
 *
 *       500:
 *         description: Internal server error
 */

router.post(
    '/verify-otp',
    verifyOtpLimiter,
    verifyOtpValidator,
    validate,
    VerifyOTP
)



/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user and sets access and refresh tokens in secure cookies.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nikhil@example.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: Password123@
 *
 *     responses:
 *       200:
 *         description: Login successful. Access and refresh tokens are stored in cookies.
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Invalid email or password
 *
 *       403:
 *         description: Email not verified or account is inactive
 *
 *       500:
 *         description: Internal server error
 */

router.post(
    '/login',
    loginLimiter,
    LoginValidator,
    validate,
    Login
)



/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     description: Returns the authenticated user's profile.
 *     tags:
 *       - Authentication
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *
 *       401:
 *         description: Authentication required or access token is invalid
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Internal server error
 */

router.get(
    '/profile',
    apiLimiter,
    authMiddleware,
    Profile
)




/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidates the refresh token and clears the access and refresh token cookies.
 *     tags:
 *       - Authentication
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     responses:
 *       200:
 *         description: Logout successful
 *
 *       401:
 *         description: Authentication required
 *
 *       500:
 *         description: Internal server error
 */



router.post(
    '/logout',
    authMiddleware,
    Logout
)



/**
 * @swagger
 * /update-profile:
 *   patch:
 *     summary: Update user profile
 *     description: Updates the authenticated user's username.
 *     tags:
 *       - Authentication
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: "^[A-Za-z0-9_]+$"
 *                 description: New username. Only letters, numbers and underscores are allowed.
 *                 example: Nikhil_Updated
 *
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Authentication required
 *
 *       409:
 *         description: Username already exists
 *
 *       500:
 *         description: Internal server error
 */

router.patch(
    '/update-profile',
    apiLimiter,
    authMiddleware,
    updateProfileValidator,
    validate,
    UpdateProfile
);



/**
 * @swagger
 * /change-password:
 *   patch:
 *     summary: Change password
 *     description: Changes the authenticated user's password after validating the old password.
 *     tags:
 *       - Authentication
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: Current account password.
 *                 example: OldPassword123@
 *
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Must contain uppercase, lowercase, number and special character.
 *                 example: NewPassword123@
 *
 *     responses:
 *       200:
 *         description: Password updated successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Authentication required or old password is incorrect
 *
 *       500:
 *         description: Internal server error
 */


router.patch(
    '/change-password',
    apiLimiter,
    authMiddleware,
    changePasswordValidator,
    validate,
    UpdatePassword
);





/**
 * @swagger
 * /deactivate-account:
 *   patch:
 *     summary: Deactivate account
 *     description: Deactivates the authenticated user's account and clears authentication cookies.
 *     tags:
 *       - Authentication
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       500:
 *         description: Internal server error
 */


router.patch(
    '/deactivate-account',
    apiLimiter,
    authMiddleware,
    DeactivateAccount
)




/**
 * @swagger
 * /delete-account:
 *   delete:
 *     summary: Delete account
 *     description: Permanently deletes the authenticated user's account after password verification.
 *     tags:
 *       - Authentication
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Current account password used to confirm account deletion.
 *                 example: Password123@
 *
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Authentication required or password is incorrect
 *
 *       500:
 *         description: Internal server error
 */


router.delete(
    '/delete-account',
    apiLimiter,
    authMiddleware,
    DeleteAccount
)


/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password-reset OTP to the user's registered email address.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nikhil@example.com
 *
 *     responses:
 *       200:
 *         description: Password reset request processed successfully
 *
 *       400:
 *         description: Validation error
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Internal server error
 */



router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPasswordValidator,
    validate,
    ForgotPassword
);


/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset password
 *     description: Resets the user's password using the OTP sent to their email.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nikhil@example.com
 *
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 pattern: "^[0-9]{6}$"
 *                 example: "123456"
 *
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Must contain uppercase, lowercase, number and special character.
 *                 example: NewPassword123@
 *
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Must match newPassword.
 *                 example: NewPassword123@
 *
 *     responses:
 *       200:
 *         description: Password reset successfully
 *
 *       400:
 *         description: Validation error, invalid OTP, or passwords do not match
 *
 *       500:
 *         description: Internal server error
 */


router.post(
    "/reset-password",
    verifyOtpLimiter,
    resetPasswordValidator,
    validate,
    ResetPassword
);


router.post(
    "/google",
    googleLoginController
);










export default router;














