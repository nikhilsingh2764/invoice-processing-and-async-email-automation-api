import generateToken from "./generateToken.js";
import hashToken from "./hashToken.js";

const DEFAULT_ACCESS_EXPIRES_IN = "15m";
const DEFAULT_REFRESH_EXPIRES_IN = "15d";
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

// Converts a jsonwebtoken style duration ("15m", "7d", 3600) to milliseconds.
export const expiresInToMs = (expiresIn) => {
    if (typeof expiresIn === "number" && Number.isFinite(expiresIn)) return expiresIn * 1000;

    const match = String(expiresIn || "")
        .trim()
        .match(/^(\d+)\s*([smhd])$/i);

    if (!match) return FIFTEEN_DAYS_MS;

    const value = parseInt(match[1], 10);

    switch (match[2].toLowerCase()) {
        case "d":
            return value * 24 * 60 * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        case "m":
            return value * 60 * 1000;
        default:
            return value * 1000;
    }
};

export const getAccessExpiresIn = () =>
    process.env.ACCESS_TOKEN_EXPIRES_IN?.trim() || DEFAULT_ACCESS_EXPIRES_IN;

export const getRefreshExpiresIn = () =>
    process.env.REFRESH_TOKEN_EXPIRES_IN?.trim() || DEFAULT_REFRESH_EXPIRES_IN;

// Creates a new access + refresh token pair for a user.
// Falls back to safe defaults when the *_EXPIRES_IN variables are empty, so a token is never
// issued without an expiry.
export const issueTokenPair = (user) => {
    const accessToken = generateToken(
        { id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        getAccessExpiresIn()
    );

    const refreshToken = generateToken(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        getRefreshExpiresIn()
    );

    return {
        accessToken,
        refreshToken,
        refreshTokenHash: hashToken(refreshToken),
        refreshTokenExpiresAt: new Date(Date.now() + expiresInToMs(getRefreshExpiresIn())),
    };
};
