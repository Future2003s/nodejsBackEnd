import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "../utils/AppError";

// Handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => ({
            field: "path" in error ? error.path : "unknown",
            message: error.msg
        }));

        return next(new AppError(`Validation failed: ${errorMessages.map((e) => e.message).join(", ")}`, 400));
    }

    next();
};

// User registration validation
export const validateRegister = [
    body("firstName")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters"),

    body("lastName").trim().isLength({ min: 2, max: 50 }).withMessage("Last name must be between 2 and 50 characters"),

    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

    body("phone").optional().isMobilePhone("any").withMessage("Please provide a valid phone number"),

    handleValidationErrors
];

// User login validation
export const validateLogin = [
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),

    body("password").notEmpty().withMessage("Password is required"),

    handleValidationErrors
];

// Product validation
export const validateProduct = [
    body("name").trim().isLength({ min: 2, max: 200 }).withMessage("Product name must be between 2 and 200 characters"),

    body("description")
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage("Description must be between 10 and 5000 characters"),

    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),

    body("sku").trim().notEmpty().withMessage("SKU is required"),

    body("category").isMongoId().withMessage("Valid category ID is required"),

    body("quantity").optional().isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),

    body("brand").optional().isMongoId().withMessage("Valid brand ID is required"),

    body("comparePrice").optional().isFloat({ min: 0 }).withMessage("Compare price must be a positive number"),

    body("salePrice").optional().isFloat({ min: 0 }).withMessage("Sale price must be a positive number"),

    handleValidationErrors
];

// Category validation
export const validateCategory = [
    body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Category name must be between 2 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),

    handleValidationErrors
];

// Order validation
export const validateOrder = [
    body("items").isArray({ min: 1 }).withMessage("Order must contain at least one item"),

    body("items.*.product").isMongoId().withMessage("Invalid product ID"),

    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),

    body("shippingAddress").notEmpty().withMessage("Shipping address is required"),

    body("shippingAddress.street").trim().notEmpty().withMessage("Street address is required"),

    body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),

    body("shippingAddress.zipCode").trim().notEmpty().withMessage("Zip code is required"),

    body("shippingAddress.country").trim().notEmpty().withMessage("Country is required"),

    handleValidationErrors
];

// Review validation
export const validateReview = [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

    body("comment").optional().trim().isLength({ max: 1000 }).withMessage("Comment cannot exceed 1000 characters"),

    handleValidationErrors
];

// Address validation
export const validateAddress = [
    body("type").isIn(["home", "work", "other"]).withMessage("Address type must be home, work, or other"),

    body("street").trim().notEmpty().withMessage("Street address is required"),

    body("city").trim().notEmpty().withMessage("City is required"),

    body("state").trim().notEmpty().withMessage("State is required"),

    body("zipCode").trim().notEmpty().withMessage("Zip code is required"),

    body("country").trim().notEmpty().withMessage("Country is required"),

    handleValidationErrors
];

// Change password validation
export const validateChangePassword = [
    body("currentPassword").notEmpty().withMessage("Current password is required"),

    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),

    handleValidationErrors
];

// Forgot password validation
export const validateForgotPassword = [
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),

    handleValidationErrors
];

// Reset password validation
export const validateResetPassword = [
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

    handleValidationErrors
];
