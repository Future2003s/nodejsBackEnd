const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

async function createUserProperly() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Import the actual User model from backend
        const { User } = require("./src/models/User.ts");

        // Check if admin already exists
        let adminUser = await User.findOne({ role: "admin" });

        if (!adminUser) {
            console.log("👤 Creating admin user with proper model...");

            // Create admin user using the actual model (which will hash password automatically)
            adminUser = new User({
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
                password: "admin123", // Model will hash this automatically
                role: "admin",
                isActive: true,
                isEmailVerified: true,
                addresses: [],
                preferences: {
                    language: "en",
                    currency: "USD",
                    notifications: {
                        email: true,
                        sms: false,
                        push: false
                    }
                }
            });

            await adminUser.save();
            console.log("✅ Admin user created successfully with proper model");
        } else {
            console.log("👤 Admin user already exists");
        }

        console.log("\n📋 Admin User Details:");
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Password: admin123 (hashed: ${adminUser.password ? "Yes" : "No"})`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   ID: ${adminUser._id}`);

        console.log("\n🔑 Now you can test login with:");
        console.log('curl -X POST "http://localhost:8081/api/v1/auth/login" \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"email":"admin@example.com","password":"admin123"}\'');
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

createUserProperly();
