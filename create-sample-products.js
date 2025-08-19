const axios = require("axios");
const mongoose = require("mongoose");

const API_BASE_URL = "http://localhost:8081/api/v1";

async function createSampleProducts() {
    console.log("📦 Creating Sample Products for Testing");
    console.log("🎯 Goal: Add sample products to database for CRUD testing");
    console.log("=".repeat(60));

    try {
        // Connect to MongoDB directly to create sample data
        await mongoose.connect("mongodb://localhost:27017/ShopDev", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("✅ Connected to MongoDB");

        // Get collections
        const Product = mongoose.model("Product", new mongoose.Schema({}, { strict: false }));
        const Category = mongoose.model("Category", new mongoose.Schema({}, { strict: false }));
        const Brand = mongoose.model("Brand", new mongoose.Schema({}, { strict: false }));

        // Get or create categories
        let categories = await Category.find().limit(3);
        if (categories.length === 0) {
            console.log("📂 Creating sample categories...");
            categories = await Category.create([
                { name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets" },
                { name: "Clothing", slug: "clothing", description: "Fashion and apparel" },
                { name: "Books", slug: "books", description: "Books and literature" }
            ]);
            console.log(`✅ Created ${categories.length} categories`);
        } else {
            console.log(`✅ Found ${categories.length} existing categories`);
        }

        // Get or create brands
        let brands = await Brand.find().limit(3);
        if (brands.length === 0) {
            console.log("🏷️ Creating sample brands...");
            brands = await Brand.create([
                { name: "TechCorp", slug: "techcorp", description: "Leading technology brand" },
                { name: "FashionPlus", slug: "fashionplus", description: "Premium fashion brand" },
                { name: "BookWorld", slug: "bookworld", description: "Quality book publisher" }
            ]);
            console.log(`✅ Created ${brands.length} brands`);
        } else {
            console.log(`✅ Found ${brands.length} existing brands`);
        }

        // Create sample products
        const sampleProducts = [
            {
                name: "Sample Smartphone",
                description: "A high-quality smartphone for testing purposes",
                price: 599.99,
                comparePrice: 699.99,
                salePrice: 549.99,
                sku: "PHONE-001",
                category: categories[0]._id,
                brand: brands[0]._id,
                quantity: 100,
                images: ["https://example.com/phone1.jpg"],
                features: ["5G Ready", "Dual Camera", "Fast Charging"],
                specifications: {
                    screen: "6.1 inch",
                    storage: "128GB",
                    ram: "8GB"
                },
                isActive: true,
                isFeatured: true
            },
            {
                name: "Sample T-Shirt",
                description: "Comfortable cotton t-shirt for everyday wear",
                price: 29.99,
                comparePrice: 39.99,
                salePrice: 24.99,
                sku: "SHIRT-001",
                category: categories[1]._id,
                brand: brands[1]._id,
                quantity: 200,
                images: ["https://example.com/shirt1.jpg"],
                features: ["100% Cotton", "Machine Washable", "Various Sizes"],
                specifications: {
                    material: "Cotton",
                    fit: "Regular",
                    care: "Machine wash cold"
                },
                isActive: true,
                isFeatured: false
            },
            {
                name: "Sample Programming Book",
                description: "Learn programming with this comprehensive guide",
                price: 49.99,
                comparePrice: 59.99,
                salePrice: 44.99,
                sku: "BOOK-001",
                category: categories[2]._id,
                brand: brands[2]._id,
                quantity: 50,
                images: ["https://example.com/book1.jpg"],
                features: ["500+ Pages", "Code Examples", "Beginner Friendly"],
                specifications: {
                    pages: 520,
                    language: "English",
                    format: "Paperback"
                },
                isActive: true,
                isFeatured: true
            }
        ];

        // Check if products already exist
        const existingProducts = await Product.find({ sku: { $in: sampleProducts.map((p) => p.sku) } });

        if (existingProducts.length > 0) {
            console.log(`✅ Found ${existingProducts.length} existing sample products`);
        } else {
            console.log("📦 Creating sample products...");
            const createdProducts = await Product.create(sampleProducts);
            console.log(`✅ Created ${createdProducts.length} sample products`);
        }

        // Get all products to show summary
        const allProducts = await Product.find();
        console.log(`\n📊 Database Summary:`);
        console.log(`   Products: ${allProducts.length}`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Brands: ${brands.length}`);

        // Test API endpoints
        console.log(`\n🧪 Testing API Endpoints:`);

        try {
            const productsResponse = await axios.get(`${API_BASE_URL}/products`);
            console.log(`✅ GET /products: ${productsResponse.status} (${productsResponse.data.data.length} products)`);

            if (productsResponse.data.data.length > 0) {
                const firstProduct = productsResponse.data.data[0];
                const productResponse = await axios.get(`${API_BASE_URL}/products/${firstProduct._id}`);
                console.log(`✅ GET /products/:id: ${productResponse.status} (${productResponse.data.data.name})`);
            }
        } catch (error) {
            console.log(`❌ API test failed: ${error.message}`);
        }

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");

        console.log("\n" + "=".repeat(60));
        console.log("🎉 Sample products created successfully!");
        console.log("📋 Ready for CRUD testing");
        console.log("=".repeat(60));
    } catch (error) {
        console.error("❌ Error creating sample products:", error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

// Run sample product creation
createSampleProducts().catch(console.error);
