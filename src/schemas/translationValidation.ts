import { z } from 'zod';
import { SupportedLanguages, TranslationCategories } from '../models/Translation';

/**
 * Translation key validation
 */
const translationKeySchema = z.string()
    .min(1, 'Translation key is required')
    .max(100, 'Translation key cannot exceed 100 characters')
    .regex(/^[a-z0-9._-]+$/, 'Key can only contain lowercase letters, numbers, dots, underscores and hyphens');

/**
 * Translation text validation
 */
const translationTextSchema = z.string()
    .min(1, 'Translation text is required')
    .max(1000, 'Translation text cannot exceed 1000 characters')
    .trim();

/**
 * Language validation
 */
const languageSchema = z.enum([
    SupportedLanguages.VIETNAMESE,
    SupportedLanguages.ENGLISH,
    SupportedLanguages.JAPANESE
]);

/**
 * Category validation
 */
const categorySchema = z.enum([
    TranslationCategories.PRODUCT,
    TranslationCategories.CATEGORY,
    TranslationCategories.BRAND,
    TranslationCategories.UI,
    TranslationCategories.ERROR,
    TranslationCategories.SUCCESS,
    TranslationCategories.VALIDATION,
    TranslationCategories.EMAIL,
    TranslationCategories.NOTIFICATION
]);

/**
 * Translations object validation
 */
const translationsSchema = z.object({
    vi: translationTextSchema,
    en: translationTextSchema,
    ja: translationTextSchema
});

/**
 * Create translation validation
 */
export const createTranslationSchema = z.object({
    body: z.object({
        key: translationKeySchema,
        category: categorySchema,
        translations: translationsSchema,
        description: z.string()
            .max(500, 'Description cannot exceed 500 characters')
            .optional()
    })
});

/**
 * Update translation validation
 */
export const updateTranslationSchema = z.object({
    params: z.object({
        key: translationKeySchema
    }),
    body: z.object({
        translations: z.object({
            vi: translationTextSchema.optional(),
            en: translationTextSchema.optional(),
            ja: translationTextSchema.optional()
        }).optional(),
        description: z.string()
            .max(500, 'Description cannot exceed 500 characters')
            .optional(),
        isActive: z.boolean().optional()
    })
});

/**
 * Get translation validation
 */
export const getTranslationSchema = z.object({
    params: z.object({
        key: translationKeySchema
    }),
    query: z.object({
        lang: languageSchema.optional()
    })
});

/**
 * Get translations by category validation
 */
export const getTranslationsByCategorySchema = z.object({
    params: z.object({
        category: categorySchema
    }),
    query: z.object({
        lang: languageSchema.optional()
    })
});

/**
 * Bulk get translations validation
 */
export const bulkGetTranslationsSchema = z.object({
    body: z.object({
        keys: z.array(translationKeySchema)
            .min(1, 'At least one key is required')
            .max(100, 'Cannot request more than 100 keys at once')
    }),
    query: z.object({
        lang: languageSchema.optional()
    })
});

/**
 * Search translations validation
 */
export const searchTranslationsSchema = z.object({
    query: z.object({
        query: z.string()
            .min(1, 'Search query is required')
            .max(100, 'Search query cannot exceed 100 characters'),
        language: languageSchema.optional(),
        category: categorySchema.optional()
    })
});

/**
 * Pagination validation
 */
export const paginationSchema = z.object({
    query: z.object({
        page: z.string()
            .regex(/^\d+$/, 'Page must be a positive number')
            .transform(Number)
            .refine(val => val > 0, 'Page must be greater than 0')
            .optional(),
        limit: z.string()
            .regex(/^\d+$/, 'Limit must be a positive number')
            .transform(Number)
            .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
            .optional(),
        category: categorySchema.optional(),
        search: z.string().max(100).optional(),
        isActive: z.string()
            .regex(/^(true|false)$/, 'isActive must be true or false')
            .optional()
    })
});

/**
 * Bulk import validation
 */
export const bulkImportSchema = z.object({
    body: z.object({
        translations: z.array(
            z.object({
                key: translationKeySchema,
                category: categorySchema,
                translations: translationsSchema,
                description: z.string()
                    .max(500, 'Description cannot exceed 500 characters')
                    .optional()
            })
        ).min(1, 'At least one translation is required')
         .max(1000, 'Cannot import more than 1000 translations at once')
    })
});

/**
 * Export validation
 */
export const exportTranslationsSchema = z.object({
    query: z.object({
        category: categorySchema.optional(),
        language: languageSchema.optional()
    })
});

/**
 * Delete translation validation
 */
export const deleteTranslationSchema = z.object({
    params: z.object({
        key: translationKeySchema
    })
});
