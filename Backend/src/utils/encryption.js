import crypto from "crypto";

const getSecretKey = () => {
    const keyEnv = process.env.CACHE_ENCRYPTION_KEY;
    
    if (!keyEnv) {
        throw new Error("CACHE_ENCRYPTION_KEY is not defined in environment variables.");
    }

    // A 64-character hex string represents 32 bytes; parse with 'hex' encoding
    let keyBuffer;
    if (keyEnv.length === 64) {
        keyBuffer = Buffer.from(keyEnv, "hex");
    } else {
        keyBuffer = Buffer.from(keyEnv);
    }

    // aes-256-gcm strictly requires a 32-byte key
    if (keyBuffer.length !== 32) {
        throw new Error(
            `CACHE_ENCRYPTION_KEY must be exactly 32 bytes (got ${keyBuffer.length} bytes). Use a 64-character hex string or a 32-character plaintext string.`
        );
    }

    return keyBuffer;
};

export const encryptBuffer = (buffer) => {
    const secretKey = getSecretKey();
    const iv = crypto.randomBytes(12); // Recommended IV length for GCM is 12 bytes
    const cipher = crypto.createCipheriv("aes-256-gcm", secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Pack IV (12 bytes), Tag (16 bytes), and Encrypted Data together into a single buffer
    return Buffer.concat([iv, tag, encrypted]);
};

export const decryptBuffer = (packedBuffer) => {
    const secretKey = getSecretKey();
    
    const iv = packedBuffer.subarray(0, 12);
    const tag = packedBuffer.subarray(12, 28);
    const encrypted = packedBuffer.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};