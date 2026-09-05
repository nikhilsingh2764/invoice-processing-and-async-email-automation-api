import { body } from "express-validator";


// ==============================
// Create Customer Validator
// ==============================

export const createCustomerValidator = [

    body("customerName")
        .trim()
        .notEmpty()
        .withMessage("Customer name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Customer name must be between 3 and 100 characters"),


    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .normalizeEmail()
        .isEmail()
        .withMessage("Please provide a valid email address"),


    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .matches(/^[0-9]{10}$/)
        .withMessage("Phone number must contain exactly 10 digits"),


    body("companyName")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Company name must be between 3 and 100 characters"),


    body("gstNumber")
        .optional()
        .trim()
        .matches(/^[0-9A-Za-z]{15}$/)
        .withMessage("GST number must contain exactly 15 characters"),


    body("customerType")
        .trim()
        .notEmpty()
        .withMessage("Customer type is required")
        .isIn(["Individual", "Business"])
        .withMessage("Invalid customer type"),


    body("notes")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Notes cannot exceed 500 characters"),


    // Billing Address

    body("billingAddress.addressLine1")
        .trim()
        .notEmpty()
        .withMessage("Billing address line 1 is required"),


    body("billingAddress.addressLine2")
        .optional()
        .trim(),


    body("billingAddress.city")
        .trim()
        .notEmpty()
        .withMessage("Billing city is required"),


    body("billingAddress.state")
        .trim()
        .notEmpty()
        .withMessage("Billing state is required"),


    body("billingAddress.country")
        .trim()
        .notEmpty()
        .withMessage("Billing country is required"),


    body("billingAddress.postalCode")
        .trim()
        .matches(/^[1-9][0-9]{5}$/)
        .withMessage("Invalid billing postal code"),


    // Shipping Address

    body("shippingAddress.addressLine1")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Shipping address line 1 is required"),


    body("shippingAddress.addressLine2")
        .optional()
        .trim(),


    body("shippingAddress.city")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Shipping city is required"),


    body("shippingAddress.state")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Shipping state is required"),


    body("shippingAddress.country")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Shipping country is required"),


    body("shippingAddress.postalCode")
        .optional()
        .trim()
        .matches(/^[1-9][0-9]{5}$/)
        .withMessage("Invalid shipping postal code")

];



// ==============================
// Update Customer Validator
// ==============================

export const updateCustomerValidator = [

    body("customerName")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Customer name must be between 3 and 100 characters"),


    body("email")
        .optional()
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Please provide a valid email address"),


    body("phone")
        .optional()
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage("Phone number must contain exactly 10 digits"),


    body("companyName")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Company name must be between 3 and 100 characters"),


    body("gstNumber")
        .optional()
        .trim()
        .matches(/^[0-9A-Za-z]{15}$/)
        .withMessage("GST number must contain exactly 15 characters"),


    body("customerType")
        .optional()
        .trim()
        .isIn(["Individual", "Business"])
        .withMessage("Invalid customer type"),


    body("notes")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Notes cannot exceed 500 characters"),


    body("billingAddress.addressLine1")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Billing address line 1 is required"),


    body("billingAddress.addressLine2")
        .optional()
        .trim(),


    body("billingAddress.city")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Billing city is required"),


    body("billingAddress.state")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Billing state is required"),


    body("billingAddress.country")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Billing country is required"),


    body("billingAddress.postalCode")
        .optional()
        .trim()
        .matches(/^[1-9][0-9]{5}$/)
        .withMessage("Invalid billing postal code"),


    body("shippingAddress.addressLine1")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Shipping address line 1 is required"),


    body("shippingAddress.addressLine2")
        .optional()
        .trim(),


    body("shippingAddress.city")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Shipping city is required"),


    body("shippingAddress.state")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Shipping state is required"),


    body("shippingAddress.country")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Shipping country is required"),


    body("shippingAddress.postalCode")
        .optional()
        .trim()
        .matches(/^[1-9][0-9]{5}$/)
        .withMessage("Invalid shipping postal code")

];