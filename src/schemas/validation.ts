import { z } from "zod";
import mongoose from "mongoose";

// Pre-compiled regex patterns for better performance
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const OBJECTID_REGEX = /^[0-9a-fA-F]{24}$/;

// Optimized validators with caching
const objectIdCache = new Map<string, boolean>();
const objectId = z.string().refine(
    (val) => {
        // Use regex first for quick validation
        if (!OBJECTID_REGEX.test(val)) {
            return false;
        }

        // Cache validation results
        if (objectIdCache.has(val)) {
            return objectIdCache.get(val)!;
        }

        const isValid = mongoose.Types.ObjectId.isValid(val);

        // Limit cache size to prevent memory leaks
        if (objectIdCache.size > 1000) {
            objectIdCache.clear();
        }

        objectIdCache.set(val, isValid);
        return isValid;
    },
    {
        message: "Invalid ObjectId"
    }
);

// Optimized email validation
const email = z
    .string()
    .min(5, "Email too short")
    .max(254, "Email too long")
    .refine((val) => EMAIL_REGEX.test(val), "Invalid email format")
    .transform((val) => val.toLowerCase());

// Optimized password validation
const password = z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long")
    .refine(
        (val) => PASSWORD_REGEX.test(val),
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    );

// ===== AUTH SCHEMAS =====

export const registerSchema = z.object({
    body: z.object({
        firstName: z
            .string()
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name cannot exceed 50 characters")
            .trim(),
        lastName: z
            .string()
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name cannot exceed 50 characters")
            .trim(),
        email,
        password,
        phone: z
            .string()
            .refine((val) => PHONE_REGEX.test(val), "Invalid phone number format")
            .optional()
    })
});

export const loginSchema = z.object({
    body: z.object({
        email,
        password: z.string().min(1, "Password is required")
    })
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: password
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        password
    }),
    params: z.object({
        token: z.string().min(1, "Reset token is required")
    })
});

// ===== PRODUCT SCHEMAS =====

export const createProductSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, "Product name must be at least 2 characters")
            .max(200, "Product name cannot exceed 200 characters")
            .trim(),
        description: z
            .string()
            .min(10, "Description must be at least 10 characters")
            .max(5000, "Description cannot exceed 5000 characters")
            .trim(),
        shortDescription: z.string().max(500, "Short description cannot exceed 500 characters").trim().optional(),
        price: z.number().min(0, "Price must be a positive number"),
        comparePrice: z.number().min(0, "Compare price must be a positive number").optional(),
        costPrice: z.number().min(0, "Cost price must be a positive number").optional(),
        sku: z.string().min(1, "SKU is required").trim().toUpperCase(),
        barcode: z.string().trim().optional(),
        trackQuantity: z.boolean().default(true),
        quantity: z.number().int().min(0, "Quantity must be a non-negative integer").default(0),
        allowBackorder: z.boolean().default(false),
        weight: z.number().min(0, "Weight must be a positive number").optional(),
        dimensions: z
            .object({
                length: z.number().min(0),
                width: z.number().min(0),
                height: z.number().min(0),
                unit: z.enum(["cm", "in"]).default("cm")
            })
            .optional(),
        category: objectId,
        brand: objectId.optional(),
        tags: z.array(z.string().trim().toLowerCase()).default([]),
        images: z
            .array(
                z.object({
                    url: z.string().url("Invalid image URL"),
                    alt: z.string().optional(),
                    isMain: z.boolean().default(false),
                    order: z.number().int().min(0).default(0)
                })
            )
            .default([]),
        hasVariants: z.boolean().default(false),
        variants: z
            .array(
                z.object({
                    name: z.string().min(1, "Variant name is required"),
                    options: z.array(z.string().min(1, "Variant option is required"))
                })
            )
            .default([]),
        seo: z
            .object({
                title: z.string().optional(),
                description: z.string().optional(),
                keywords: z.array(z.string()).optional()
            })
            .optional(),
        status: z.enum(["draft", "active", "archived"]).default("draft"),
        isVisible: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        onSale: z.boolean().default(false),
        salePrice: z.number().min(0, "Sale price must be a positive number").optional(),
        saleStartDate: z.string().datetime().optional(),
        saleEndDate: z.string().datetime().optional(),
        requiresShipping: z.boolean().default(true),
        shippingClass: z.string().optional()
    })
});

export const updateProductSchema = z.object({
    body: createProductSchema.shape.body.partial(),
    params: z.object({
        id: objectId
    })
});

export const productQuerySchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        sort: z.string().optional(),
        order: z.enum(["asc", "desc"]).optional(),
        category: objectId.optional(),
        brand: objectId.optional(),
        minPrice: z
            .string()
            .regex(/^\d+(\.\d+)?$/)
            .transform(Number)
            .optional(),
        maxPrice: z
            .string()
            .regex(/^\d+(\.\d+)?$/)
            .transform(Number)
            .optional(),
        tags: z
            .string()
            .transform((val) => val.split(","))
            .optional(),
        status: z.enum(["draft", "active", "archived"]).optional(),
        isVisible: z
            .string()
            .transform((val) => val === "true")
            .optional(),
        isFeatured: z
            .string()
            .transform((val) => val === "true")
            .optional(),
        onSale: z
            .string()
            .transform((val) => val === "true")
            .optional(),
        inStock: z
            .string()
            .transform((val) => val === "true")
            .optional(),
        search: z.string().optional()
    })
});

// ===== CATEGORY SCHEMAS =====

export const createCategorySchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, "Category name must be at least 2 characters")
            .max(100, "Category name cannot exceed 100 characters")
            .trim(),
        description: z.string().max(1000, "Description cannot exceed 1000 characters").trim().optional(),
        parent: objectId.optional(),
        image: z.string().url("Invalid image URL").optional(),
        icon: z.string().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
        seo: z
            .object({
                title: z.string().optional(),
                description: z.string().optional(),
                keywords: z.array(z.string()).optional()
            })
            .optional()
    })
});

export const updateCategorySchema = z.object({
    body: createCategorySchema.shape.body.partial(),
    params: z.object({
        id: objectId
    })
});

// ===== BRAND SCHEMAS =====

export const createBrandSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, "Brand name must be at least 2 characters")
            .max(100, "Brand name cannot exceed 100 characters")
            .trim(),
        description: z.string().max(1000, "Description cannot exceed 1000 characters").trim().optional(),
        logo: z.string().url("Invalid logo URL").optional(),
        website: z.string().url("Invalid website URL").optional(),
        isActive: z.boolean().default(true),
        seo: z
            .object({
                title: z.string().optional(),
                description: z.string().optional(),
                keywords: z.array(z.string()).optional()
            })
            .optional()
    })
});

export const updateBrandSchema = z.object({
    body: createBrandSchema.shape.body.partial(),
    params: z.object({
        id: objectId
    })
});

// ===== REVIEW SCHEMAS =====

export const createReviewSchema = z.object({
    body: z.object({
        product: objectId,
        rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
        title: z.string().max(200, "Review title cannot exceed 200 characters").trim().optional(),
        comment: z.string().max(2000, "Review comment cannot exceed 2000 characters").trim().optional(),
        images: z.array(z.string().url("Invalid image URL")).default([])
    })
});

export const updateReviewSchema = z.object({
    body: createReviewSchema.shape.body.partial().omit({ product: true }),
    params: z.object({
        id: objectId
    })
});

export const moderateReviewSchema = z.object({
    body: z.object({
        status: z.enum(["approved", "rejected"]),
        moderationNote: z.string().optional()
    }),
    params: z.object({
        id: objectId
    })
});

// ===== USER SCHEMAS =====

export const updateProfileSchema = z.object({
    body: z.object({
        firstName: z
            .string()
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name cannot exceed 50 characters")
            .trim()
            .optional(),
        lastName: z
            .string()
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name cannot exceed 50 characters")
            .trim()
            .optional(),
        phone: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
            .optional()
    })
});

export const addAddressSchema = z.object({
    body: z.object({
        type: z.enum(["home", "work", "other"]),
        street: z.string().min(1, "Street address is required").trim(),
        city: z.string().min(1, "City is required").trim(),
        state: z.string().min(1, "State is required").trim(),
        zipCode: z.string().min(1, "Zip code is required").trim(),
        country: z.string().min(1, "Country is required").trim(),
        isDefault: z.boolean().default(false)
    })
});

export const updateAddressSchema = z.object({
    body: addAddressSchema.shape.body.partial(),
    params: z.object({
        addressId: objectId
    })
});

// ===== COMMON SCHEMAS =====

export const idParamSchema = z.object({
    params: z.object({
        id: objectId
    })
});

export const slugParamSchema = z.object({
    params: z.object({
        slug: z.string().min(1, "Slug is required")
    })
});

// Type exports for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
