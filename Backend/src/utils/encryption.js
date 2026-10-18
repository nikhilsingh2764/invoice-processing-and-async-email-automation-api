import crypto from "crypto";

// Use an environment variable for the secret key (must be 32 bytes for aes-256-gcm)
const SECRET_KEY = process.env.CACHE_ENCRYPTION_KEY || crypto.randomBytes(32);

export const encryptBuffer = (buffer) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(SECRET_KEY), iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Pack IV, Tag, and Encrypted Data together into a single buffer or base64 string
    return Buffer.concat([iv, tag, encrypted]);
};

export const decryptBuffer = (packedBuffer) => {
    const iv = packedBuffer.subarray(0, 12);
    const tag = packedBuffer.subarray(12, 28);
    const encrypted = packedBuffer.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(SECRET_KEY), iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};
