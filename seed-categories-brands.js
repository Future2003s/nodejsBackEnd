const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

// Category Schema (simple version for seeding)
const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,
        slug: String,
        parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Changed from parentId to parent
        image: String,
        icon: String,
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 1 },
        productCount: { type: Number, default: 0 },
        seo: {
            title: String,
            description: String,
            keywords: [String]
        }
    },
    {
        timestamps: true
    }
);

// Brand Schema (simple version for seeding)
const brandSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,
        slug: String,
        logo: String,
        website: String,
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 1 },
        seo: {
            title: String,
            description: String,
            keywords: [String]
        }
    },
    {
        timestamps: true
    }
);

// User Schema (simple version for seeding)
const userSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        email: String,
        role: String
    },
    {
        timestamps: true
    }
);

const Category = mongoose.model("Category", categorySchema);
const Brand = mongoose.model("Brand", brandSchema);
const User = mongoose.model("User", userSchema);

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

async function seedCategories(adminUser) {
    console.log("🌱 Seeding categories...");

    const categories = [
        {
            name: "Electronics",
            description: "Electronic devices and gadgets",
            slug: "electronics",
            isActive: true,
            sortOrder: 1,
            productCount: 0,
            seo: {
                title: "Electronics - Latest Gadgets and Devices",
                description: "Shop the latest electronics, smartphones, laptops, and gadgets",
                keywords: ["electronics", "gadgets", "smartphones", "laptops"]
            }
        },
        {
            name: "Clothing",
            description: "Fashion and apparel for all ages",
            slug: "clothing",
            isActive: true,
            sortOrder: 2,
            productCount: 0,
            seo: {
                title: "Clothing - Fashion and Apparel",
                description: "Discover the latest fashion trends and clothing for men, women, and kids",
                keywords: ["clothing", "fashion", "apparel", "men", "women", "kids"]
            }
        },
        {
            name: "Books",
            description: "Books, magazines, and educational materials",
            slug: "books",
            isActive: true,
            sortOrder: 3,
            productCount: 0,
            seo: {
                title: "Books - Literature and Educational Materials",
                description: "Browse our collection of books, novels, textbooks, and magazines",
                keywords: ["books", "literature", "education", "novels", "textbooks"]
            }
        },
        {
            name: "Home & Garden",
            description: "Home improvement and gardening supplies",
            slug: "home-garden",
            isActive: true,
            sortOrder: 4,
            productCount: 0,
            seo: {
                title: "Home & Garden - Furniture and Gardening Supplies",
                description: "Everything for your home and garden needs",
                keywords: ["home", "garden", "furniture", "decor", "plants"]
            }
        },
        {
            name: "Sports & Outdoors",
            description: "Sports equipment and outdoor gear",
            slug: "sports-outdoors",
            isActive: true,
            sortOrder: 5,
            productCount: 0,
            seo: {
                title: "Sports & Outdoors - Equipment and Gear",
                description: "Quality sports equipment and outdoor adventure gear",
                keywords: ["sports", "outdoors", "equipment", "fitness", "adventure"]
            }
        },
        {
            name: "Health & Beauty",
            description: "Health products and beauty essentials",
            slug: "health-beauty",
            isActive: true,
            sortOrder: 6,
            productCount: 0,
            seo: {
                title: "Health & Beauty - Wellness and Cosmetics",
                description: "Health supplements, skincare, and beauty products",
                keywords: ["health", "beauty", "skincare", "cosmetics", "wellness"]
            }
        }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
        try {
            // Check if category already exists
            const existingCategory = await Category.findOne({ slug: categoryData.slug });
            if (existingCategory) {
                console.log(`   ⏭️  Category "${categoryData.name}" already exists`);
                createdCategories.push(existingCategory);
                continue;
            }

            const category = new Category(categoryData);
            const savedCategory = await category.save();
            createdCategories.push(savedCategory);
            console.log(`   ✅ Created category: ${categoryData.name}`);
        } catch (error) {
            console.error(`   ❌ Error creating category ${categoryData.name}:`, error.message);
        }
    }

    return createdCategories;
}

async function seedBrands(adminUser) {
    console.log("🌱 Seeding brands...");

    const brands = [
        {
            name: "Apple",
            description: "Premium technology products and services",
            slug: "apple",
            logo: "https://logo.clearbit.com/apple.com",
            website: "https://www.apple.com",
            isActive: true,
            sortOrder: 1,
            seo: {
                title: "Apple - Premium Technology Products",
                description: "Apple iPhone, iPad, Mac, and more premium technology products",
                keywords: ["apple", "iphone", "ipad", "mac", "technology"]
            }
        },
        {
            name: "Samsung",
            description: "Innovative electronics and technology solutions",
            slug: "samsung",
            logo: "https://logo.clearbit.com/samsung.com",
            website: "https://www.samsung.com",
            isActive: true,
            sortOrder: 2,
            seo: {
                title: "Samsung - Innovative Electronics",
                description: "Samsung smartphones, TVs, appliances, and technology solutions",
                keywords: ["samsung", "galaxy", "smartphone", "tv", "electronics"]
            }
        },
        {
            name: "Nike",
            description: "Athletic footwear, apparel, and sports equipment",
            slug: "nike",
            logo: "https://logo.clearbit.com/nike.com",
            website: "https://www.nike.com",
            isActive: true,
            sortOrder: 3,
            seo: {
                title: "Nike - Athletic Footwear and Apparel",
                description: "Nike shoes, clothing, and sports equipment for athletes",
                keywords: ["nike", "shoes", "athletic", "sports", "apparel"]
            }
        },
        {
            name: "Adidas",
            description: "Sports apparel, footwear, and accessories",
            slug: "adidas",
            logo: "https://logo.clearbit.com/adidas.com",
            website: "https://www.adidas.com",
            isActive: true,
            sortOrder: 4,
            seo: {
                title: "Adidas - Sports Apparel and Footwear",
                description: "Adidas sports shoes, clothing, and accessories",
                keywords: ["adidas", "sports", "shoes", "apparel", "accessories"]
            }
        },
        {
            name: "Sony",
            description: "Consumer electronics and entertainment products",
            slug: "sony",
            logo: "https://logo.clearbit.com/sony.com",
            website: "https://www.sony.com",
            isActive: true,
            sortOrder: 5,
            seo: {
                title: "Sony - Consumer Electronics",
                description: "Sony cameras, headphones, gaming consoles, and electronics",
                keywords: ["sony", "electronics", "camera", "headphones", "playstation"]
            }
        },
        {
            name: "Microsoft",
            description: "Software, hardware, and cloud computing solutions",
            slug: "microsoft",
            logo: "https://logo.clearbit.com/microsoft.com",
            website: "https://www.microsoft.com",
            isActive: true,
            sortOrder: 6,
            seo: {
                title: "Microsoft - Software and Technology Solutions",
                description: "Microsoft Windows, Office, Xbox, and cloud computing solutions",
                keywords: ["microsoft", "windows", "office", "xbox", "software"]
            }
        },
        {
            name: "IKEA",
            description: "Affordable furniture and home accessories",
            slug: "ikea",
            logo: "https://logo.clearbit.com/ikea.com",
            website: "https://www.ikea.com",
            isActive: true,
            sortOrder: 7,
            seo: {
                title: "IKEA - Affordable Furniture and Home Accessories",
                description: "IKEA furniture, home decor, and accessories for modern living",
                keywords: ["ikea", "furniture", "home", "decor", "accessories"]
            }
        },
        {
            name: "Zara",
            description: "Fast fashion clothing and accessories",
            slug: "zara",
            logo: "https://logo.clearbit.com/zara.com",
            website: "https://www.zara.com",
            isActive: true,
            sortOrder: 8,
            seo: {
                title: "Zara - Fast Fashion Clothing",
                description: "Zara trendy clothing, shoes, and accessories for men and women",
                keywords: ["zara", "fashion", "clothing", "trendy", "accessories"]
            }
        }
    ];

    const createdBrands = [];
    for (const brandData of brands) {
        try {
            // Check if brand already exists
            const existingBrand = await Brand.findOne({ slug: brandData.slug });
            if (existingBrand) {
                console.log(`   ⏭️  Brand "${brandData.name}" already exists`);
                createdBrands.push(existingBrand);
                continue;
            }

            const brand = new Brand(brandData);
            const savedBrand = await brand.save();
            createdBrands.push(savedBrand);
            console.log(`   ✅ Created brand: ${brandData.name}`);
        } catch (error) {
            console.error(`   ❌ Error creating brand ${brandData.name}:`, error.message);
        }
    }

    return createdBrands;
}

async function seedData() {
    try {
        console.log("🚀 Starting to seed categories and brands...");

        // Find or create admin user
        let adminUser = await User.findOne({ role: "ADMIN" });
        if (!adminUser) {
            console.log("⚠️  No admin user found. Creating a default admin user...");
            adminUser = new User({
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
                role: "ADMIN"
            });
            await adminUser.save();
            console.log("✅ Created default admin user");
        }

        // Seed categories
        const categories = await seedCategories(adminUser);

        // Seed brands
        const brands = await seedBrands(adminUser);

        console.log("\n🎉 Seeding completed successfully!");
        console.log("\n📊 Summary:");
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Brands: ${brands.length}`);

        console.log("\n📋 Created Categories:");
        categories.forEach((cat) => console.log(`   - ${cat.name} (${cat.slug})`));

        console.log("\n🏷️  Created Brands:");
        brands.forEach((brand) => console.log(`   - ${brand.name} (${brand.slug})`));

        console.log("\n🔗 You can now test the API endpoints:");
        console.log("   GET /api/v1/categories - Get all categories");
        console.log("   GET /api/v1/brands - Get all brands");
        console.log("   Frontend: http://localhost:3000/api/meta/categories");
        console.log("   Frontend: http://localhost:3000/api/meta/brands");
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
