export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/dashboard",

  BUSINESS: "/business",

  CUSTOMERS: "/customers",

  PRODUCTS: "/products",

  INVOICES: "/invoices",
  INVOICE_NEW: "/invoices/new",
  INVOICE_VIEW: (id) => `/invoices/${id}`,
  INVOICE_EDIT: (id) => `/invoices/${id}/edit`,

  PROFILE: "/profile",
  EDIT_PROFILE: "/edit-profile",
  CHANGE_PASSWORD: "/change-password",
};
