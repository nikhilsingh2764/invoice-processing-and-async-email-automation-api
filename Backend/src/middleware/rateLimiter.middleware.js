
//----------------------------------------------------------------------------------------------------------------------------------------------------

//code of redis rate limit ok

import rateLimit from "express-rate-limit"; //middleware limit API request
import { RedisStore } from "rate-limit-redis"; //store rate limit data inside redis instead of node memory
import redis from "../config/redis.js"; //redis client connection


// reusable Redis Store
const createStore = (prefix) =>
    new RedisStore({
        sendCommand: (...args) => redis.call(...args), // express-rate-limit uses this function to communicate with Redis
        prefix, //keeps different limiters like login signup separeated in redis
    });



//----------------------------------------------------------------------------------------------------------------------------------------------------
//Auth API limiter


// ==============================
// Login Limiter
// 5 requests / 1 minute
// ==============================


export const loginLimiter = rateLimit({

    store: createStore("login:"), //store count in redis store/cache

    windowMs: 1 * 60 * 1000,  //1 min - Time window for counting requests

    max: 15,  //maximum 5 request send


    standardHeaders: true, // Sends modern RateLimit headers - RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset

    legacyHeaders: false, //Disable old X-RateLimit-* headers


    message: {   //Response returned when limit is exceeded

        success: false,

        message:
            "Too many login attempts. Try again after 1 minute.",

    },


});



// ==============================
// Signup Limiter
// 3 requests / 1 hour
// ==============================



export const signupLimiter = rateLimit({

    store: createStore("signup:"), //store req count in redis store
    windowMs: 60 * 60 * 1000, //1 hr 
    max: 30,

    standardHeaders: true,

    legacyHeaders: false,


    message: {

        success: false,

        message:
            "Too many signup attempts. Try again later.",

    },



});





// ==============================
// Verify OTP Limiter
// 10 requests / 15 minutes
// ==============================

export const verifyOtpLimiter = rateLimit({

    store: createStore("verifyOtp:"),

    windowMs: 15 * 60 * 1000, //15 min

    max: 30,  //10 request 

    standardHeaders: true,

    legacyHeaders: false,

    message: {

        success: false,

        message:
            "Too many OTP verification attempts.",

    },

});




// ==============================
// Forgot Password Limiter
// 3 requests / 15 minutes
// ==============================

export const forgotPasswordLimiter = rateLimit({

    store: createStore("forgotPassword:"),
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,

        message:
            "Too many password reset requests.",
    }




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
        message: "Too many refresh requests."
    }


});


// ==============================
// General API Limiter
// For authenticated routes
// 200 requests / 15 minutes
// ==============================



export const apiLimiter = rateLimit({

    store: createStore("api:"),

    windowMs: 15 * 60 * 1000,

    max: 200,

    standardHeaders: true,

    legacyHeaders: false,

    message: {

        success: false,

        message:
            "Too many requests. Please try again later.",

    },

});





//----------------------------------------------------------------------------------------------------------------------------------------------------
// Business API Limiter
// Create/Update/Delete Business


//Create Business API Limiter

export const businessLimiter = rateLimit({

    store: createStore("business:"),

    windowMs: 15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {

        success: false,

        message:
            "Too many requests. Please try again later.",

    },


});




//----------------------------------------------------------------------------------------------------------------------------------------------------
// product API Limiter
// Create/Update/Delete product

export const ProductLimiter = rateLimit({

    store: createStore("product:"),

    windowMs: 15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {

        success: false,

        message:
            "Too many requests. Please try again later.",

    },


});


//----------------------------------------------------------------------------------------------------------------------------------------------------
// Customer API Limiter
// Create/Update/Delete Customer

export const CustomerLimiter = rateLimit({

    store: createStore("customer:"),

    windowMs: 15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {

        success: false,

        message:
            "Too many requests. Please try again later.",

    },


});






//----------------------------------------------------------------------------------------------------------------------------------------------------
// invoice API Limiter

const rateLimitMessage = {
    success: false,
    message: "Too many requests. Please try again later."
};

export const invoiceCreateLimiter = rateLimit({

    store: createStore("invoice:create"),

    windowMs: 15 * 60 * 1000,

    max: 30,

    standardHeaders: true,

    legacyHeaders: false,

    message: rateLimitMessage
});



export const invoiceReadLimiter = rateLimit ({

    store: createStore("invoice:create"),

    windowMs: 15 * 60 * 1000,

    max: 300,

    standardHeaders: true,

    legacyHeaders: false,

    message: rateLimitMessage
});


export const invoiceUpdateLimiter = rateLimit ({

    store: createStore("invoice:update:"),

    windowMs: 15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: rateLimitMessage

});


export const invoiceDeleteLimiter = rateLimit ({

    store: createStore("invoice:delete:"),

    windowMs: 15 * 60 * 1000,

    max: 20,

    standardHeaders: true,

    legacyHeaders: false,

    message: rateLimitMessage

});


export const invoiceEmailLimiter = rateLimit ({

    store: createStore("invoice:email:"),

    windowMs: 60 * 60 * 1000,

    max: 30,

    standardHeaders: true,

    legacyHeaders: false,

    message: rateLimitMessage

});


export const invoiceWhatsappLimiter = rateLimit ({

    store: createStore("invoice:whatsapp:"),

    windowMs: 60 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: rateLimitMessage

});



export const invoiceDuplicateLimiter = rateLimit ({

    store: createStore("invoice:duplicate:"),

    windowMs: 15 * 60 * 1000,

    max: 20,

    standardHeaders: true,

    legacyHeaders: false,

    message: rateLimitMessage

});

