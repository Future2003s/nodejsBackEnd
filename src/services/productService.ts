import { Product, IProduct } from "../models/Product";
import { Category } from "../models/Category";
import { Brand } from "../models/Brand";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { CacheWrapper, QueryAnalyzer } from "../utils/performance";
import { CACHE_PREFIXES, CACHE_TTL } from "../config/redis";
import { paginateQuery } from "../utils/pagination";

interface CreateProductData {
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    comparePrice?: number;
    costPrice?: number;
    sku: string;
    barcode?: string;
    trackQuantity?: boolean;
    quantity?: number;
    allowBackorder?: boolean;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: "cm" | "in";
    };
    category: string;
    brand?: string;
    tags?: string[];
    images?: Array<{
        url: string;
        alt?: string;
        isMain: boolean;
        order: number;
    }>;
    hasVariants?: boolean;
    variants?: Array<{
        name: string;
        options: string[];
    }>;
    seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
    };
    status?: "draft" | "active" | "archived";
    isVisible?: boolean;
    isFeatured?: boolean;
    onSale?: boolean;
    salePrice?: number;
    saleStartDate?: Date;
    saleEndDate?: Date;
    requiresShipping?: boolean;
    shippingClass?: string;
}

interface UpdateProductData extends Partial<CreateProductData> {}

interface ProductFilters {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    status?: string;
    isVisible?: boolean;
    isFeatured?: boolean;
    onSale?: boolean;
    inStock?: boolean;
    search?: string;
}

interface ProductQuery {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
}

export class ProductService {
    private static cache = new CacheWrapper(CACHE_PREFIXES.PRODUCTS, CACHE_TTL.MEDIUM);
    private static categoryCache = new CacheWrapper(CACHE_PREFIXES.CATEGORIES, CACHE_TTL.LONG);
    private static brandCache = new CacheWrapper(CACHE_PREFIXES.BRANDS, CACHE_TTL.LONG);

    /**
     * Create a new product
     */
    static async createProduct(productData: CreateProductData, userId: string): Promise<IProduct> {
        try {
            // Validate category exists
            const category = await Category.findById(productData.category);
            if (!category) {
                throw new AppError("Category not found", 404);
            }

            // Validate brand if provided
            if (productData.brand) {
                const brand = await Brand.findById(productData.brand);
                if (!brand) {
                    throw new AppError("Brand not found", 404);
                }
            }

            // Check if SKU already exists
            const existingProduct = await Product.findOne({ sku: productData.sku });
            if (existingProduct) {
                throw new AppError("Product with this SKU already exists", 400);
            }

            // Create product
            const product = await Product.create({
                ...productData,
                createdBy: userId
            });

            // Update category product count
            await Category.findByIdAndUpdate(productData.category, { $inc: { productCount: 1 } });

            // Update brand product count if brand is provided
            if (productData.brand) {
                await Brand.findByIdAndUpdate(productData.brand, { $inc: { productCount: 1 } });
            }

            await product.populate(["category", "brand", "createdBy"]);

            logger.info(`Product created: ${product.name} by user: ${userId}`);
            return product;
        } catch (error) {
            logger.error("Create product error:", error);
            throw error;
        }
    }

    /**
     * Get products with filters and pagination
     */
    static async getProducts(
        filters: ProductFilters = {},
        query: ProductQuery = {}
    ): Promise<{
        products: IProduct[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }> {
        try {
            const { page = 1, limit = 20, sort = "createdAt", order = "desc" } = query;

            // Generate cache key based on filters and query
            const cacheKey = this.generateCacheKey("products", filters, query);

            // Try to get from cache first
            const cached = await this.cache.get<any>(cacheKey);
            if (cached) {
                logger.debug(`Cache hit for products: ${cacheKey}`);
                return cached;
            }

            // Build optimized filter query
            const filterQuery = this.buildProductFilterQuery(filters);

            // Create base query
            const baseQuery = Product.find(filterQuery);

            // Use optimized pagination
            const result = await paginateQuery(baseQuery, {
                page,
                limit,
                sort,
                order,
                maxLimit: 100,
                cacheTTL: CACHE_TTL.SHORT,
                cacheKey
            });

            // Transform the result to match expected format
            const response = {
                products: result.data,
                pagination: {
                    page: result.pagination.page,
                    limit: result.pagination.limit,
                    total: result.pagination.total,
                    pages: result.pagination.pages
                }
            };

            // Cache the result
            await this.cache.set(cacheKey, response, CACHE_TTL.SHORT);

            return response;
        } catch (error) {
            logger.error("Get products error:", error);
            throw error;
        }
    }

    /**
     * Get product by ID (with caching)
     */
    static async getProductById(productId: string): Promise<IProduct> {
        try {
            // Try cache first
            const cacheKey = `product:${productId}`;
            const cached = await this.cache.get<IProduct>(cacheKey);
            if (cached) {
                return cached;
            }

            const product = await Product.findById(productId)
                .populate("category", "name slug description")
                .populate("brand", "name slug logo website")
                .populate("createdBy", "firstName lastName")
                .lean();

            if (!product) {
                throw new AppError("Product not found", 404);
            }

            // Cache the result
            await this.cache.set(cacheKey, product, CACHE_TTL.MEDIUM);
            return product as IProduct;
        } catch (error) {
            logger.error("Get product by ID error:", error);
            throw error;
        }
    }

    /**
     * Get product by slug (with caching)
     */
    static async getProductBySlug(slug: string): Promise<IProduct> {
        try {
            const cacheKey = `product:slug:${slug}`;
            const cached = await this.cache.get<IProduct>(cacheKey);
            if (cached) {
                return cached;
            }

            const product = await Product.findOne({ slug })
                .populate("category", "name slug description")
                .populate("brand", "name slug logo website")
                .populate("createdBy", "firstName lastName")
                .lean();

            if (!product) {
                throw new AppError("Product not found", 404);
            }

            await this.cache.set(cacheKey, product, CACHE_TTL.MEDIUM);
            return product as IProduct;
        } catch (error) {
            logger.error("Get product by slug error:", error);
            throw error;
        }
    }

    /**
     * Update product (with cache invalidation)
     */
    static async updateProduct(productId: string, updateData: UpdateProductData, userId: string): Promise<IProduct> {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw new AppError("Product not found", 404);
            }

            // Validate category if provided
            if (updateData.category && updateData.category !== product.category.toString()) {
                const categoryExists = await Category.findById(updateData.category);
                if (!categoryExists) {
                    throw new AppError("Category not found", 404);
                }
            }

            // Validate brand if provided
            if (updateData.brand && updateData.brand !== product.brand?.toString()) {
                const brandExists = await Brand.findById(updateData.brand);
                if (!brandExists) {
                    throw new AppError("Brand not found", 404);
                }
            }

            // Update product
            Object.assign(product, updateData);
            product.updatedBy = userId as any;
            await product.save();

            // Invalidate cache
            await this.invalidateProductCache(productId);

            await product.populate(["category", "brand", "createdBy"]);
            return product;
        } catch (error) {
            logger.error("Update product error:", error);
            throw error;
        }
    }

    /**
     * Delete product (with cache invalidation)
     */
    static async deleteProduct(productId: string): Promise<void> {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw new AppError("Product not found", 404);
            }

            await Product.findByIdAndDelete(productId);

            // Invalidate cache
            await this.invalidateProductCache(productId);

            logger.info(`Product deleted: ${product.name}`);
        } catch (error) {
            logger.error("Delete product error:", error);
            throw error;
        }
    }

    /**
     * Helper method to build optimized filter query
     */
    private static buildProductFilterQuery(filters: ProductFilters): any {
        const filterQuery: any = {};

        if (filters.category) {
            filterQuery.category = filters.category;
        }

        if (filters.brand) {
            filterQuery.brand = filters.brand;
        }

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            filterQuery.price = {};
            if (filters.minPrice !== undefined) {
                filterQuery.price.$gte = filters.minPrice;
            }
            if (filters.maxPrice !== undefined) {
                filterQuery.price.$lte = filters.maxPrice;
            }
        }

        if (filters.tags && filters.tags.length > 0) {
            filterQuery.tags = { $in: filters.tags };
        }

        if (filters.status) {
            filterQuery.status = filters.status;
        }

        if (filters.isVisible !== undefined) {
            filterQuery.isVisible = filters.isVisible;
        }

        if (filters.isFeatured !== undefined) {
            filterQuery.isFeatured = filters.isFeatured;
        }

        if (filters.onSale !== undefined) {
            filterQuery.onSale = filters.onSale;
        }

        if (filters.inStock !== undefined) {
            if (filters.inStock) {
                filterQuery.$or = [{ trackQuantity: false }, { quantity: { $gt: 0 } }, { allowBackorder: true }];
            } else {
                filterQuery.trackQuantity = true;
                filterQuery.quantity = { $lte: 0 };
                filterQuery.allowBackorder = false;
            }
        }

        if (filters.search) {
            filterQuery.$text = { $search: filters.search };
        }

        return filterQuery;
    }

    /**
     * Generate cache key for products
     */
    private static generateCacheKey(prefix: string, filters: any, query: any): string {
        const keyParts = [prefix, JSON.stringify(filters), JSON.stringify(query)];

        const keyString = keyParts.join("|");
        return Buffer.from(keyString).toString("base64").slice(0, 50);
    }

    /**
     * Invalidate product cache
     */
    static async invalidateProductCache(pattern?: string): Promise<void> {
        try {
            if (pattern) {
                await this.cache.invalidatePattern(pattern);
            } else {
                await this.cache.invalidatePattern("*");
            }
            logger.info("Product cache invalidated");
        } catch (error) {
            logger.error("Error invalidating product cache:", error);
        }
    }

    /**
     * Get featured products (with caching)
     */
    static async getFeaturedProducts(limit: number = 10): Promise<IProduct[]> {
        try {
            const cacheKey = `featured:${limit}`;
            const cached = await this.cache.get<IProduct[]>(cacheKey);
            if (cached) {
                return cached;
            }

            const products = await Product.find({
                isFeatured: true,
                status: "active",
                isVisible: true
            })
                .populate("category", "name slug")
                .populate("brand", "name slug logo")
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();

            await this.cache.set(cacheKey, products, CACHE_TTL.MEDIUM);
            return products as IProduct[];
        } catch (error) {
            logger.error("Get featured products error:", error);
            throw error;
        }
    }

    /**
     * Search products (with caching)
     */
    static async searchProducts(
        searchTerm: string,
        filters: ProductFilters = {},
        query: ProductQuery = {}
    ): Promise<{
        products: IProduct[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }> {
        return this.getProducts({ ...filters, search: searchTerm }, query);
    }

    /**
     * Update product stock (with cache invalidation)
     */
    static async updateStock(productId: string, quantity: number): Promise<IProduct> {
        try {
            const product = await Product.findByIdAndUpdate(
                productId,
                { quantity },
                { new: true, runValidators: true }
            );

            if (!product) {
                throw new AppError("Product not found", 404);
            }

            // Invalidate cache
            await this.invalidateProductCache(productId);

            return product;
        } catch (error) {
            logger.error("Update stock error:", error);
            throw error;
        }
    }
}
