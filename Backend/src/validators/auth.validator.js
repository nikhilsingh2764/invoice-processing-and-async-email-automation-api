import { body } from "express-validator";

const passwordValidator = (fieldName) => {

    return body(fieldName)
        .notEmpty()
        .withMessage(`${fieldName} is required`)
        .bail()
        .isLength({ min: 8 })
        .withMessage("Password must have minimum 8 characters")
        .matches(/[A-Z]/)
        .withMessage("Password must contain one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain one number")
        .matches(/[@$!%*?&]/)
        .withMessage("Password must contain one special character");
};



export const signupValidator = [

    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3, max: 30 })
        .withMessage("Username must be between 3 and 30 characters")
        .matches(/^[A-Za-z0-9_]+$/)
        .withMessage("Username can only contain letters, numbers, and underscores"),


    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),


    passwordValidator("password")

];



export const verifyOtpValidator = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),


    body("otp")
        .trim()
        .notEmpty()
        .withMessage("OTP is required")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits")
        .isInt()
        .withMessage("OTP must contain only numbers")

];



export const LoginValidator = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),


    passwordValidator("password")

];



export const updateProfileValidator = [

    body("username")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("Username must be between 3 and 30 characters")
        .matches(/^[A-Za-z0-9_]+$/)
        .withMessage("Username can only contain letters, numbers, and underscores")

];



export const changePasswordValidator = [

    body("oldPassword")
        .notEmpty()
        .withMessage("Old password is required"),


    passwordValidator("newPassword")

];



export const forgotPasswordValidator = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail()

];



export const resetPasswordValidator = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),


    body("otp")
        .trim()
        .notEmpty()
        .withMessage("OTP is required")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits")
        .isInt()
        .withMessage("OTP must contain only numbers"),


    passwordValidator("newPassword"),


    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .bail()
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match");
            }

            return true;
        })

];