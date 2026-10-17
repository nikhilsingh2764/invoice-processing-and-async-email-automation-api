import RefreshToken from "../../model/auth/refreshToken.model.js";

class RefreshTokenRepository {

    async create(data) {
        return await RefreshToken.create(data);
    }

    // Find token record using its SHA-256 hash instead of the raw token
    async findByTokenHash(tokenHash) {
        return await RefreshToken.findOne({
            tokenHash
        });
    }

    // Revoke or delete a specific token by its hash during rotation
    async revokeTokenByHash(tokenHash) {
        return await RefreshToken.deleteOne({
            tokenHash
        });
    }

    // Revoke all active sessions for a user (used during reuse detection / security alerts)
    async revokeAllUserSessions(userId) {
        return await RefreshToken.updateMany(
            { userId },
            { $set: { isRevoked: true } }
        );
    }

    async deleteByUserId(userId) {
        return await RefreshToken.deleteMany({
            userId
        });
    }

}

export default new RefreshTokenRepository();