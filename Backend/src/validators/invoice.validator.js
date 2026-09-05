import { body } from "express-validator";


export const createInvoiceValidator = [

    body("customerId")
        .notEmpty()
        .withMessage("Customer is required")
        .isMongoId()
        .withMessage("Invalid customer id"),

    body("items")
        .isArray({ min: 1 })
        .withMessage("Invoice must contain at least one product"),

    body("items.*.productId")
        .notEmpty()
        .withMessage("Product is required")
        .isMongoId()
        .withMessage("Invalid product id"),

    body("items.*.quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),

    body("dueDate")
        .notEmpty()
        .withMessage("Due date is required")
        .isISO8601()
        .withMessage("Invalid due date"),

    body("status")
        .optional()
        .isIn([
            "Draft",
            "Pending",
            "Paid",
            "Partially Paid",
            "Overdue",
            "Cancelled"
        ])
        .withMessage("Invalid invoice status"),

    body("paymentMethod")
        .optional()
        .isIn([
            "Cash",
            "UPI",
            "Credit Card",
            "Debit Card",
            "Bank Transfer",
            "Cheque"
        ])
        .withMessage("Invalid payment method"),

    body("notes")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Notes cannot exceed 1000 characters"),

    body("termsAndConditions")
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Terms and conditions cannot exceed 2000 characters")

];



export const updateInvoiceValidator = [

    body("customerId")
        .optional()
        .isMongoId()
        .withMessage("Invalid customer id"),

    body("items")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Invoice must contain at least one product"),

    body("items.*.productId")
        .optional()
        .isMongoId()
        .withMessage("Invalid product id"),

    body("items.*.quantity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),

    body("dueDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid due date"),

    body("status")
        .optional()
        .isIn([
            "Draft",
            "Pending",
            "Paid",
            "Partially Paid",
            "Overdue",
            "Cancelled"
        ])
        .withMessage("Invalid invoice status"),

    body("paymentMethod")
        .optional()
        .isIn([
            "Cash",
            "UPI",
            "Credit Card",
            "Debit Card",
            "Bank Transfer",
            "Cheque"
        ])
        .withMessage("Invalid payment method"),

    body("notes")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Notes cannot exceed 1000 characters"),

    body("termsAndConditions")
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Terms and conditions cannot exceed 2000 characters")

];