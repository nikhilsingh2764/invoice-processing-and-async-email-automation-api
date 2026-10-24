// Feature switches and tunables kept in one place.
export const FEATURES = {
  // B2: invoices do not store customerId yet, so the server-side customer filter matches nothing.
  customerFilter: false,
  // The backend exposes GET /invoice/email/status/:jobId; the UI uses it to confirm delivery.
  emailStatus: true,
}

export const SESSION = { idleMinutes: 30, warnSeconds: 60 }
export const PDF_POLL = { intervalMs: 1500, maxAttempts: 30 }
export const EMAIL_POLL = { intervalMs: 2000, maxAttempts: 15 }
export const OTP = { lifetimeSeconds: 300, maxWrongCodes: 5 }
export const LOCKOUT = { rateLimitSeconds: 60, accountLockSeconds: 15 * 60 }
export const POLICY_VERSION = '2026-10-18'
