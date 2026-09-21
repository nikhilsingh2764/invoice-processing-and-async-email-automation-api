import api from "../api/axios";

// ==========================
// Authentication API Endpoints
// ==========================

const AUTH_ENDPOINTS = {

    LOGIN: "/login",

    SIGNUP: "/signup",

    VERIFY_OTP: "/verify-otp",

    FORGOT_PASSWORD: "/forgot-password",

    RESET_PASSWORD: "/reset-password",

    LOGOUT: "/logout",

    PROFILE: "/profile",

    CHANGE_PASSWORD: "/change-password",

    UPDATE_PROFILE: "/update-profile",

    DEACTIVATE_ACCOUNT: "/deactivate-account",

    DELETE_ACCOUNT: "/delete-account",

};

// ==========================
// Signup
// ==========================

export const signup = async (data) => {

    const response = await api.post(
        AUTH_ENDPOINTS.SIGNUP,
        data
    );

    return response.data;

};

// ==========================
// Verify Signup OTP
// ==========================

export const verifyOtp = async (data) => {

    const response = await api.post(
        AUTH_ENDPOINTS.VERIFY_OTP,
        data
    );

    return response.data;

};

// ==========================
// Login
// ==========================

export const login = async (data) => {

    const response = await api.post(
        AUTH_ENDPOINTS.LOGIN,
        data
    );

    return response.data;

};

// ==========================
// Logout
// ==========================

export const logout = async () => {

    const response = await api.post(
        AUTH_ENDPOINTS.LOGOUT
    );

    return response.data;

};

// ==========================
// Get Logged In User Profile
// ==========================

export const getProfile = async () => {

    const response = await api.get(
        AUTH_ENDPOINTS.PROFILE
    );

    return response.data;

};

// ==========================
// Forgot Password
// ==========================

export const forgotPassword = async (data) => {

    const response = await api.post(
        AUTH_ENDPOINTS.FORGOT_PASSWORD,
        data
    );

    return response.data;

};

// ==========================
// Reset Password
// ==========================

export const resetPassword = async (data) => {

    const response = await api.post(
        AUTH_ENDPOINTS.RESET_PASSWORD,
        data
    );

    return response.data;

};

// ==========================
// Change Password
// ==========================

export const changePassword = async (data) => {

    const response = await api.patch(
        AUTH_ENDPOINTS.CHANGE_PASSWORD,
        data
    );

    return response.data;

};

// ==========================
// Update Profile
// ==========================

export const updateProfile = async (data) => {

    const response = await api.patch(
        AUTH_ENDPOINTS.UPDATE_PROFILE,
        data
    );

    return response.data;

};

// ==========================
// Deactivate Account
// ==========================

export const deactivateAccount = async () => {

    const response = await api.patch(
        AUTH_ENDPOINTS.DEACTIVATE_ACCOUNT
    );

    return response.data;

};

// ==========================
// Delete Account
// ==========================

export const deleteAccount = async (data) => {

    const response = await api.delete(
        AUTH_ENDPOINTS.DELETE_ACCOUNT,
        {
            data,
        }
    );

    return response.data;

};