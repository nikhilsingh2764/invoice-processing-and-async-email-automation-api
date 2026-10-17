import jwt from "jsonwebtoken";
import crypto from "crypto";


// Generate JWT (Access Token or Refresh Token)
const generateToken = (payload, secret, expiresIn) => {

    // If payload is an object, ensure it gets a unique jti claim
    const tokenPayload = (typeof payload === "object" && payload !== null)
        ? { ...payload, jti: payload.jti || crypto.randomUUID() } : payload;

    return jwt.sign(
        tokenPayload,      // Data to store inside token
        secret,       // Secret key
        {
            expiresIn // Token expiry time
        }
    );

};

export default generateToken;

