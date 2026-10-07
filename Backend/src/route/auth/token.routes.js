import express from 'express';
import {RefreshToken} from '../../controller/auth/token.controller.js';
import { refreshTokenLimiter } from '../../middleware/rateLimiter.middleware.js';

 

const router = express.Router();


/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token using the refresh token stored in the refreshToken cookie.
 *     tags:
 *       - Authentication
 *
 *     security:
 *       - refreshTokenCookie: []
 *
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *
 *       401:
 *         description: Refresh token is missing, invalid, expired, or revoked
 *
 *       500:
 *         description: Internal server error
 */


router.post(
    '/refresh-token', 
    refreshTokenLimiter, 
    RefreshToken)


export default router;

