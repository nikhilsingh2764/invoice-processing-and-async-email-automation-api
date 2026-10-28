import { OAuth2Client } from "google-auth-library";
import ApiError from "./ApiError.js";

let client = null;

const getClient = () => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        // Without an audience, Google tokens issued for ANY app would be accepted.
        throw new ApiError(503, "Google login is not configured");
    }

    if (!client) {
        client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    return client;
};

export const verifyGoogleToken = async (idToken) => {
    const oauthClient = getClient();

    let payload;

    try {
        const ticket = await oauthClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        payload = ticket.getPayload();
    } catch (error) {
        throw new ApiError(401, "Invalid Google token");
    }

    if (!payload?.email || !payload.email_verified) {
        throw new ApiError(401, "Google email is not verified");
    }

    return {
        googleId: payload.sub,
        email: payload.email.trim().toLowerCase(),
        username: payload.name,
        picture: payload.picture,
    };
};
