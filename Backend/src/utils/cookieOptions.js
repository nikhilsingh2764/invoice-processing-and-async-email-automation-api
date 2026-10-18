const isProduction = process.env.NODE_ENV === "production";

export const accessTokenOptions = {
    httpOnly: true,
    secure: isProduction, // Must be true in production for SameSite=None
    sameSite: isProduction ? "none" : "lax", // "none" allows cross-site requests between Vercel and Render
    maxAge: 15 * 60 * 1000, // 15 min
};

export const refreshTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
};
