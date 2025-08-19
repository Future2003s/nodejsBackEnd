const mongoose = require("mongoose");
const Product = require("./src/models/Product");
const Category = require("./src/models/Category");
const Brand = require("./src/models/Brand");
const User = require("./src/models/User");

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

async function seedData() {
    try {
        console.log("🚀 Starting to seed products data...");

        // Find or create admin user
        let adminUser = await User.findOne({ role: "ADMIN" });
        if (!adminUser) {
            console.log("⚠️  No admin user found. Please create an admin user first.");
            return;
        }

        // Create categories
        const categories = await Category.create([
            {
                name: "Electronics",
                description: "Electronic devices and gadgets",
                slug: "electronics",
                isActive: true,
                sortOrder: 1,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            {
                name: "Clothing",
                description: "Fashion and apparel",
                slug: "clothing",
                isActive: true,
                sortOrder: 2,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            {
                name: "Home & Garden",
                description: "Home improvement and garden supplies",
                slug: "home-garden",
                isActive: true,
                sortOrder: 3,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            {
                name: "Sports & Outdoors",
                description: "Sports equipment and outdoor gear",
                slug: "sports-outdoors",
                isActive: true,
                sortOrder: 4,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            {
                name: "Books & Media",
                description: "Books, movies, and music",
                slug: "books-media",
                isActive: true,
                sortOrder: 5,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            }
        ]);

        console.log(`✅ Created ${categories.length} categories`);

        // Create brands
        const brands = await Brand.create([
            {
                name: "Apple",
                description: "Innovative technology company",
                slug: "apple",
                logo: "https://via.placeholder.com/150x150/000000/FFFFFF?text=Apple",
                website: "https://www.apple.com",
                isActive: true,
                sortOrder: 1,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            {
                name: "Samsung",
                description: "Global technology leader",
                slug: "samsung",
                logo: "https://via.placeholder.com/150x150/1428A0/FFFFFF?text=Samsung",
                website: "https://www.samsung.com",
                isActive: true,
                sortOrder: 2,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            {
                name: "Nike",
                description: "Just do it",
                slug: "nike",
                logo: "https://via.placeholder.com/150x150/000000/FFFFFF?text=Nike",
                website: "https://www.nike.com",
                isActive: true,
                sortOrder: 3,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            {
                name: "Adidas",
                description: "Impossible is nothing",
                slug: "adidas",
                logo: "https://via.placeholder.com/150x150/000000/FFFFFF?text=Adidas",
                website: "https://www.adidas.com",
                isActive: true,
                sortOrder: 4,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            {
                name: "IKEA",
                description: "Creating a better everyday life",
                slug: "ikea",
                logo: "https://via.placeholder.com/150x150/0051BA/FFFFFF?text=IKEA",
                website: "https://www.ikea.com",
                isActive: true,
                sortOrder: 5,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            }
        ]);

        console.log(`✅ Created ${brands.length} brands`);

        // Create sample products
        const products = await Product.create([
            // Electronics
            {
                name: "iPhone 15 Pro",
                description: "The most advanced iPhone ever with A17 Pro chip, titanium design, and pro camera system.",
                sku: "IPHONE15PRO-128",
                price: 29990000,
                basePrice: 29990000,
                stock: 50,
                minStock: 10,
                maxStock: 100,
                categoryId: categories[0]._id, // Electronics
                brandId: brands[0]._id, // Apple
                status: "ACTIVE",
                images: [
                    "https://via.placeholder.com/400x400/000000/FFFFFF?text=iPhone+15+Pro+1",
                    "https://via.placeholder.com/400x400/000000/FFFFFF?text=iPhone+15+Pro+2",
                    "https://via.placeholder.com/400x400/000000/FFFFFF?text=iPhone+15+Pro+3"
                ],
                thumbnail: "https://via.placeholder.com/400x400/000000/FFFFFF?text=iPhone+15+Pro",
                tags: ["smartphone", "apple", "5g", "camera"],
                specifications: {
                    "Screen Size": "6.1 inch",
                    Storage: "128GB",
                    Color: "Titanium",
                    Chip: "A17 Pro"
                },
                weight: 187,
                dimensions: { length: 7.81, width: 3.88, height: 0.84 },
                isFeatured: true,
                isNew: true,
                isBestSeller: true,
                rating: 4.8,
                reviewCount: 1250,
                viewCount: 5000,
                soldCount: 850,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            {
                name: "Samsung Galaxy S24 Ultra",
                description: "Ultimate Android experience with S Pen, pro-grade camera, and AI features.",
                sku: "SAMSUNG-S24ULTRA-256",
                price: 27990000,
                basePrice: 27990000,
                stock: 45,
                minStock: 10,
                maxStock: 100,
                categoryId: categories[0]._id, // Electronics
                brandId: brands[1]._id, // Samsung
                status: "ACTIVE",
                images: [
                    "https://via.placeholder.com/400x400/1428A0/FFFFFF?text=Galaxy+S24+Ultra+1",
                    "https://via.placeholder.com/400x400/1428A0/FFFFFF?text=Galaxy+S24+Ultra+2"
                ],
                thumbnail: "https://via.placeholder.com/400x400/1428A0/FFFFFF?text=Galaxy+S24+Ultra",
                tags: ["smartphone", "samsung", "5g", "camera", "s-pen"],
                specifications: {
                    "Screen Size": "6.8 inch",
                    Storage: "256GB",
                    Color: "Titanium Gray",
                    "S Pen": "Yes"
                },
                weight: 232,
                dimensions: { length: 8.22, width: 3.94, height: 0.88 },
                isFeatured: true,
                isNew: true,
                isBestSeller: false,
                rating: 4.7,
                reviewCount: 980,
                viewCount: 4200,
                soldCount: 720,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            // Clothing
            {
                name: "Nike Air Max 270",
                description: "Comfortable running shoes with Air Max technology for maximum cushioning.",
                sku: "NIKE-AIRMAX270-42",
                price: 3500000,
                basePrice: 3500000,
                stock: 100,
                minStock: 20,
                maxStock: 200,
                categoryId: categories[1]._id, // Clothing
                brandId: brands[2]._id, // Nike
                status: "ACTIVE",
                images: [
                    "https://via.placeholder.com/400x400/000000/FFFFFF?text=Nike+Air+Max+270+1",
                    "https://via.placeholder.com/400x400/000000/FFFFFF?text=Nike+Air+Max+270+2"
                ],
                thumbnail: "https://via.placeholder.com/400x400/000000/FFFFFF?text=Nike+Air+Max+270",
                tags: ["shoes", "running", "nike", "air-max"],
                specifications: {
                    Size: "42",
                    Color: "Black/White",
                    Material: "Mesh",
                    Sole: "Rubber"
                },
                weight: 320,
                dimensions: { length: 30, width: 12, height: 8 },
                isFeatured: false,
                isNew: false,
                isBestSeller: true,
                rating: 4.6,
                reviewCount: 850,
                viewCount: 3200,
                soldCount: 1200,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            {
                name: "Adidas Ultraboost 22",
                description: "Premium running shoes with Boost midsole for energy return and comfort.",
                sku: "ADIDAS-ULTRABOOST22-41",
                price: 4200000,
                basePrice: 4200000,
                stock: 75,
                minStock: 15,
                maxStock: 150,
                categoryId: categories[1]._id, // Clothing
                brandId: brands[3]._id, // Adidas
                status: "ACTIVE",
                images: [
                    "https://via.placeholder.com/400x400/000000/FFFFFF?text=Adidas+Ultraboost+22+1",
                    "https://via.placeholder.com/400x400/000000/FFFFFF?text=Adidas+Ultraboost+22+2"
                ],
                thumbnail: "https://via.placeholder.com/400x400/000000/FFFFFF?text=Adidas+Ultraboost+22",
                tags: ["shoes", "running", "adidas", "boost"],
                specifications: {
                    Size: "41",
                    Color: "Blue/White",
                    Material: "Primeknit",
                    Sole: "Continental Rubber"
                },
                weight: 310,
                dimensions: { length: 29, width: 11.5, height: 7.5 },
                isFeatured: true,
                isNew: false,
                isBestSeller: false,
                rating: 4.5,
                reviewCount: 720,
                viewCount: 2800,
                soldCount: 950,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            // Home & Garden
            {
                name: "IKEA Billy Bookcase",
                description:
                    "Classic bookcase with adjustable shelves, perfect for organizing books and decorative items.",
                sku: "IKEA-BILLY-80x28x202",
                price: 1200000,
                basePrice: 1200000,
                stock: 25,
                minStock: 5,
                maxStock: 50,
                categoryId: categories[2]._id, // Home & Garden
                brandId: brands[4]._id, // IKEA
                status: "ACTIVE",
                images: [
                    "https://via.placeholder.com/400x400/0051BA/FFFFFF?text=IKEA+Billy+Bookcase+1",
                    "https://via.placeholder.com/400x400/0051BA/FFFFFF?text=IKEA+Billy+Bookcase+2"
                ],
                thumbnail: "https://via.placeholder.com/400x400/0051BA/FFFFFF?text=IKEA+Billy+Bookcase",
                tags: ["furniture", "bookcase", "ikea", "storage"],
                specifications: {
                    Dimensions: "80x28x202 cm",
                    Material: "Particleboard",
                    Color: "White",
                    Weight: "25 kg"
                },
                weight: 25000,
                dimensions: { length: 80, width: 28, height: 202 },
                isFeatured: false,
                isNew: false,
                isBestSeller: false,
                rating: 4.4,
                reviewCount: 450,
                viewCount: 1800,
                soldCount: 380,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            // Sports & Outdoors
            {
                name: "Nike Pro Training Shorts",
                description: "Lightweight training shorts with built-in liner for comfort during workouts.",
                sku: "NIKE-PRO-SHORTS-M",
                price: 850000,
                basePrice: 850000,
                stock: 120,
                minStock: 25,
                maxStock: 250,
                categoryId: categories[3]._id, // Sports & Outdoors
                brandId: brands[2]._id, // Nike
                status: "ACTIVE",
                images: [
                    "https://via.placeholder.com/400x400/000000/FFFFFF?text=Nike+Pro+Shorts+1",
                    "https://via.placeholder.com/400x400/000000/FFFFFF?text=Nike+Pro+Shorts+2"
                ],
                thumbnail: "https://via.placeholder.com/400x400/000000/FFFFFF?text=Nike+Pro+Shorts",
                tags: ["shorts", "training", "nike", "workout"],
                specifications: {
                    Size: "M",
                    Color: "Black",
                    Material: "Polyester",
                    Fit: "Slim"
                },
                weight: 180,
                dimensions: { length: 45, width: 35, height: 2 },
                isFeatured: false,
                isNew: false,
                isBestSeller: false,
                rating: 4.3,
                reviewCount: 320,
                viewCount: 1500,
                soldCount: 680,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            },
            // Books & Media
            {
                name: "The Art of Computer Programming",
                description: "Comprehensive guide to computer programming by Donald Knuth.",
                sku: "BOOK-KNUTH-VOL1",
                price: 1200000,
                basePrice: 1200000,
                stock: 15,
                minStock: 3,
                maxStock: 30,
                categoryId: categories[4]._id, // Books & Media
                brandId: null, // No specific brand
                status: "ACTIVE",
                images: ["https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Computer+Programming+Book+1"],
                thumbnail: "https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Computer+Programming+Book",
                tags: ["book", "programming", "computer-science", "reference"],
                specifications: {
                    Pages: "672",
                    Language: "English",
                    Format: "Hardcover",
                    ISBN: "978-0201896831"
                },
                weight: 1200,
                dimensions: { length: 24, width: 18, height: 4 },
                isFeatured: false,
                isNew: false,
                isBestSeller: false,
                rating: 4.9,
                reviewCount: 150,
                viewCount: 800,
                soldCount: 120,
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            }
        ]);

        console.log(`✅ Created ${products.length} products`);

        console.log("\n🎉 Seeding completed successfully!");
        console.log("\n📊 Summary:");
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Brands: ${brands.length}`);
        console.log(`   Products: ${products.length}`);
        console.log("\n🔗 You can now test the products API endpoints:");
        console.log("   GET /api/v1/products - Get all products");
        console.log("   GET /api/v1/products/admin/all - Get admin products");
        console.log("   GET /api/v1/products/:id - Get product by ID");
        console.log("   POST /api/v1/products/create - Create new product");
        console.log("   PUT /api/v1/products/:id - Update product");
        console.log("   DELETE /api/v1/products/:id - Delete product");
    } catch (error) {
        console.error("❌ Seeding error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

// Run the seeding
if (require.main === module) {
    connectDB().then(seedData);
}

module.exports = { connectDB, seedData };
