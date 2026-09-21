import jwt from "jsonwebtoken";

import ApiError from "../utils/ApiError.js";
import userRepository from "../repository/auth/user.repository.js";
import TryCatch from "./TryCatch.js";
import translate from "../utils/translate.js";


const authMiddleware = TryCatch(async (
    req,
    res,
    next
) => {

    // Get token from cookies
    const accessToken =
        req.cookies.accessToken;


    // Check token exists
    if (!accessToken) {

        throw new ApiError(
            401,
            translate(
                "AUTH.TOKEN_REQUIRED",
                req.language
            )
        );
    }


    // Verify JWT
    let decoded;

    try {

        decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        );

    } catch (error) {

        throw new ApiError(
            401,
            translate(
                "AUTH.INVALID_TOKEN",
                req.language
            )
        );
    }


    // Find latest user in DB
    const user =
        await userRepository.findById(
            decoded.id
        );


    if (!user) {

        throw new ApiError(
            401,
            translate(
                "AUTH.USER_NOT_FOUND",
                req.language
            )
        );
    }


    // Check user is active
    if (!user.isActive) {

        throw new ApiError(
            403,
            translate(
                "AUTH.ACCOUNT_INACTIVE",
                req.language
            )
        );
    }


    // Store authenticated user
    req.user = user;

    next();
});


export default authMiddleware;