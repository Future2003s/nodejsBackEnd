import { Router } from "express";
import { protect, authorize } from "../middleware/auth";
import { generalRateLimit, adminRateLimit } from "../middleware/rateLimiting";
import { staticDataCache } from "../middleware/compression";
import { validate } from "../middleware/zodValidation";
import {
    getTranslation,
    getTranslations,
    getTranslationsByCategory,
    getAllTranslations,
    getPaginatedTranslations,
    createTranslation,
    updateTranslation,
    deleteTranslation,
    searchTranslations,
    getTranslationStats,
    bulkImportTranslations,
    exportTranslations
} from "../controllers/translationController";
import {
    createTranslationSchema,
    updateTranslationSchema,
    getTranslationSchema,
    getTranslationsByCategorySchema,
    bulkGetTranslationsSchema,
    searchTranslationsSchema,
    bulkImportSchema,
    deleteTranslationSchema
} from "../schemas/translationValidation";

const router = Router();

// Public routes for getting translations (with caching and validation)
router.get("/key/:key", staticDataCache(3600), generalRateLimit, validate(getTranslationSchema), getTranslation);
router.post("/bulk", staticDataCache(1800), generalRateLimit, validate(bulkGetTranslationsSchema), getTranslations);
router.get(
    "/category/:category",
    staticDataCache(3600),
    generalRateLimit,
    validate(getTranslationsByCategorySchema),
    getTranslationsByCategory
);
router.get("/all", staticDataCache(1800), generalRateLimit, getAllTranslations);

// Admin routes for managing translations
router.use(protect);
router.use(authorize("admin", "translator"));

// CRUD operations with validation
router.get("/", adminRateLimit, getPaginatedTranslations);
router.post("/", adminRateLimit, validate(createTranslationSchema), createTranslation);
router.put("/:key", adminRateLimit, validate(updateTranslationSchema), updateTranslation);
router.delete("/:key", adminRateLimit, validate(deleteTranslationSchema), deleteTranslation);

// Search and statistics with validation
router.get("/search", adminRateLimit, validate(searchTranslationsSchema), searchTranslations);
router.get("/stats", adminRateLimit, getTranslationStats);

// Bulk operations with validation
router.post("/bulk-import", adminRateLimit, validate(bulkImportSchema), bulkImportTranslations);
router.get("/export", adminRateLimit, exportTranslations);

export default router;
