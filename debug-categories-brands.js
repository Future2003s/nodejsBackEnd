const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

async function debugCategoriesBrands() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Import models
        const { Category } = require("./src/models/Category.ts");
        const { Brand } = require("./src/models/Brand.ts");

        console.log("\n📋 Testing Categories:");
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories`);
        if (categories.length > 0) {
            console.log("First category:", JSON.stringify(categories[0], null, 2));
        }

        console.log("\n🏷️ Testing Brands:");
        const brands = await Brand.find({});
        console.log(`Found ${brands.length} brands`);
        if (brands.length > 0) {
            console.log("First brand:", JSON.stringify(brands[0], null, 2));
        }

        // Test filters
        console.log("\n🔍 Testing active filter:");
        const activeCategories = await Category.find({ isActive: true });
        console.log(`Active categories: ${activeCategories.length}`);

        const activeBrands = await Brand.find({ isActive: true });
        console.log(`Active brands: ${activeBrands.length}`);
    } catch (error) {
        console.error("❌ Debug error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

debugCategoriesBrands();
