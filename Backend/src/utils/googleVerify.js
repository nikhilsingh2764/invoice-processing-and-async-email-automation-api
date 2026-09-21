import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (idToken) => {

    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified) {
        throw new Error("Google email is not verified");
    }

    return {
        googleId: payload.sub,
        email: payload.email,
        username: payload.name,
        picture: payload.picture
    };
};