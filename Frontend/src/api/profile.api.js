import { client, unwrap } from './client';

// GET /profile -> { id, username, email, isVerified, isActive, createdAt, updatedAt }
export const getProfile = () => client.get('/profile').then(unwrap);
// PATCH /update-profile  { username }
export const updateProfile = (body) => client.patch('/update-profile', body).then(unwrap);
// PATCH /change-password { oldPassword, newPassword }
export const changePassword = (body) => client.patch('/change-password', body).then(unwrap);
// PATCH /deactivate-account
export const deactivateAccount = () => client.patch('/deactivate-account').then(unwrap);
// DELETE /delete-account { password }
export const deleteAccount = (password) => client.delete('/delete-account', { data: { password } }).then(unwrap);
