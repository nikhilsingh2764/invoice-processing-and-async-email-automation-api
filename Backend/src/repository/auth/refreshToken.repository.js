import RefreshToken from "../../model/auth/refreshToken.model.js";

class RefreshTokenRepository {
    async create(data) {
        return await RefreshToken.create(data);
    }

    // Find token record using its SHA-256 hash instead of the raw token
    async findByTokenHash(tokenHash) {
        return await RefreshToken.findOne({
            tokenHash,
        });
    }

    // Atomically remove and return a token record. Only ONE concurrent caller gets the record,
    // which makes refresh-token rotation race-free.
    async consumeByTokenHash(tokenHash) {
        return await RefreshToken.findOneAndDelete({
            tokenHash,
        });
    }

    // Delete a specific token by its hash (logout)
    async revokeTokenByHash(tokenHash) {
        return await RefreshToken.deleteOne({
            tokenHash,
        });
    }

    // Revoke all active sessions for a user (used during reuse detection / security alerts)
    async revokeAllUserSessions(userId) {
        return await RefreshToken.updateMany({ userId }, { $set: { isRevoked: true } });
    }

    async deleteByUserId(userId, session = null) {
        return await RefreshToken.deleteMany({ userId }).session(session);
    }
}

export default new RefreshTokenRepository();
