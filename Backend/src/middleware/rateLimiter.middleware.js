import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis"; //store rate limit data inside redis instead of node memory
import redis from "../config/redis.js"; //redis client connection
import withTimeout from "../utils/withTimeout.js";

// reusable Redis Store
const createStore = (prefix) =>
    new RedisStore({
        sendCommand: (...args) => withTimeout(redis.call(...args), 2000, "Rate limit store"), // express-rate-limit uses this function to communicate with Redis
        prefix, //keeps different limiters like login signup separeated in redis
    });

//----------------------------------------------------------------------------------------------------------------------------------------------------
//Auth API limiter

// ==============================
// Login Limiter
// 5 requests / 1 minute (IP + Email)
// ==============================

export const loginLimiter = rateLimit({
    store: createStore("login:"),
    windowMs: 1 * 60 * 1000, // 1 min
    max: 5, // maximum 5 requests
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const clientIp = ipKeyGenerator(req); // Safely handles IPv6 and trust proxy
        const identifier = req.body?.email ? req.body.email.trim().toLowerCase() : "";
        return `${clientIp}-${identifier}`;
    },
    message: {
        success: false,
        message: "Too many login attempts. Try again after 1 minute.",
    },
});

// ==============================
// Google Login Limiter
// 20 requests / 1 minute (IP)
// ==============================

export const googleLoginLimiter = rateLimit({
    store: createStore("googleLogin:"),
    windowMs: 1 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Try again after 1 minute.",
    },
});

// ==============================
// Signup Limiter
// 3 requests / 1 hour
// ==============================

export const signupLimiter = rateLimit({
    store: createStore("signup:"),
    windowMs: 60 * 60 * 1000, // 1 hr
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many signup attempts. Try again later.",
    },
});

// ==============================
// Verify OTP Limiter
// 10 requests / 15 minutes (IP + Email)
// ==============================

export const verifyOtpLimiter = rateLimit({
    store: createStore("verifyOtp:"),
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10, // 10 requests
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const clientIp = ipKeyGenerator(req);
        const identifier = req.body?.email ? req.body.email.trim().toLowerCase() : "";
        return `${clientIp}-${identifier}`;
    },
    message: {
        success: false,
        message: "Too many OTP verification attempts.",
    },
});

// ==============================
// Forgot Password Limiter
// 3 requests / 15 minutes (IP + Email)
// ==============================

export const forgotPasswordLimiter = rateLimit({
    store: createStore("forgotPassword:"),
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const clientIp = ipKeyGenerator(req);
        const identifier = req.body?.email ? req.body.email.trim().toLowerCase() : "";
        return `${clientIp}-${identifier}`;
    },
    message: {
        success: false,
        message: "Too many password reset requests.",
    },
});

// ==============================
// Refresh Token Limiter
// 30 requests / 1 minute
// ==============================

export const refreshTokenLimiter = rateLimit({
    store: createStore("refreshToken:"),
    windowMs: 1 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many refresh requests.",
    },
});

// ==============================
// General API Limiter
// For authenticated routes
// 100 requests / 15 minutes
// ==============================

export const apiLimiter = rateLimit({
    store: createStore("api:"),
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    passOnStoreError: true,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Business API Limiter
// Create/Update/Delete Business

export const businessLimiter = rateLimit({
    store: createStore("business:"),
    windowMs: 15 * 60 * 1000,
    max: 100,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

//----------------------------------------------------------------------------------------------------------------------------------------------------
// product API Limiter
// Create/Update/Delete product

export const ProductLimiter = rateLimit({
    store: createStore("product:"),
    windowMs: 15 * 60 * 1000,
    max: 100,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Customer API Limiter
// Create/Update/Delete Customer

export const CustomerLimiter = rateLimit({
    store: createStore("customer:"),
    windowMs: 15 * 60 * 1000,
    max: 100,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

//----------------------------------------------------------------------------------------------------------------------------------------------------
// invoice API Limiter

const rateLimitMessage = {
    success: false,
    message: "Too many requests. Please try again later.",
};

export const invoiceCreateLimiter = rateLimit({
    store: createStore("invoice:create"),
    windowMs: 15 * 60 * 1000,
    max: 30,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
});

export const invoiceReadLimiter = rateLimit({
    store: createStore("invoice:read:"),
    windowMs: 15 * 60 * 1000,
    max: 300,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
});

export const invoiceUpdateLimiter = rateLimit({
    store: createStore("invoice:update:"),
    windowMs: 15 * 60 * 1000,
    max: 100,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
});

export const invoiceDeleteLimiter = rateLimit({
    store: createStore("invoice:delete:"),
    windowMs: 15 * 60 * 1000,
    max: 20,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
});

export const invoiceEmailLimiter = rateLimit({
    store: createStore("invoice:email:"),
    windowMs: 60 * 60 * 1000,
    max: 15,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
});

export const invoicePdfLimiter = rateLimit({
    store: createStore("invoice:pdf:"),
    windowMs: 60 * 60 * 1000,
    max: 15,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
});

export const invoiceDuplicateLimiter = rateLimit({
    store: createStore("invoice:duplicate:"),
    windowMs: 15 * 60 * 1000,
    max: 15,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
});
