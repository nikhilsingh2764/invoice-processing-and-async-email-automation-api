import { client, unwrap } from './client';

// POST /signup            -> 201 { data: { email } }   (sends OTP email)
export const signup = (body) => client.post('/signup', body).then(unwrap);
// POST /verify-otp        -> 201                        (creates the verified account)
export const verifyOtp = (body) => client.post('/verify-otp', body).then(unwrap);
// POST /login             -> 200 { data: { id, email, username } } + sets accessToken/refreshToken cookies
export const login = (body) => client.post('/login', body).then(unwrap);
// POST /google            -> 200 { data: <user> }       + sets cookies
export const googleLogin = (idToken) => client.post('/google', { idToken }).then(unwrap);
// POST /logout            -> 200                        (requires auth; revokes refresh token, clears cookies)
export const logout = () => client.post('/logout').then(unwrap);
// POST /forgot-password   -> 200                        (sends OTP email)
export const forgotPassword = (email) => client.post('/forgot-password', { email }).then(unwrap);
// POST /reset-password    -> 200
export const resetPassword = (body) => client.post('/reset-password', body).then(unwrap);
