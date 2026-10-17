import mongoose from "mongoose";


const refreshTokenSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    tokenHash: {
        type: String,
        required: true,
        unique: true
    },

    isRevoked: {
        type: Boolean,
        default: false
    },

    expiresAt: {
        type: Date,
        required: true
    }


}, { timestamps: true });

// Automatically delete expired tokens from MongoDB using a TTL index
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ token: 1 });


const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;