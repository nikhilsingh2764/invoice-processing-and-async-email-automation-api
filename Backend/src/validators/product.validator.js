import { body } from "express-validator";


export const createProductValidator = [
    body("productName")
        .trim()
        .notEmpty()
        .withMessage("Product name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Product name must be between 3 and 100 characters"),


    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),


    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required"),


    body("unit")
        .trim()
        .notEmpty()
        .withMessage("Unit is required")
        .isIn([
            "piece",
            "kg",
            "gram",
            "liter",
            "meter",
            "hour",
            "service"
        ])
        .withMessage("Invalid unit"),


    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .isFloat({ min: 0 })
        .withMessage("Price must be greater than or equal to 0"),


    body("taxRate")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Tax rate must be between 0 and 100"),


    body("discount")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Discount must be between 0 and 100")
];



export const updateProductValidator = [

    body("productName")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Product name must be between 3 and 100 characters"),


    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),


    body("category")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category cannot be empty"),


    body("unit")
        .optional()
        .trim()
        .isIn([
            "piece",
            "kg",
            "gram",
            "liter",
            "meter",
            "hour",
            "service"
        ])
        .withMessage("Invalid unit"),


    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be greater than or equal to 0"),


    body("taxRate")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Tax rate must be between 0 and 100"),


    body("discount")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Discount must be between 0 and 100")

];