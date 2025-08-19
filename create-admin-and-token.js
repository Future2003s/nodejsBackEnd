const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

// User Schema (simple version for seeding)
const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

async function createAdminAndToken() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Check if admin already exists
        let adminUser = await User.findOne({ role: "admin" });

        if (!adminUser) {
            console.log("👤 Creating admin user...");

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin123", salt);

            // Create admin user
            adminUser = new User({
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
                password: hashedPassword,
                role: "admin",
                isActive: true
            });

            await adminUser.save();
            console.log("✅ Admin user created successfully");
        } else {
            console.log("👤 Admin user already exists");
        }

        console.log("\n📋 Admin User Details:");
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Password: admin123`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   ID: ${adminUser._id}`);

        // Test login to get token
        console.log("\n🔐 Testing login to get JWT token...");

        // Simulate login (you'll need to use the actual auth endpoint)
        const loginData = {
            email: adminUser.email,
            password: "admin123"
        };

        console.log("\n📝 To get JWT token, use this login data:");
        console.log("POST http://localhost:8081/api/v1/auth/login");
        console.log("Body:", JSON.stringify(loginData, null, 2));

        console.log("\n🔑 Or use this curl command:");
        console.log(`curl -X POST "http://localhost:8081/api/v1/auth/login" \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify(loginData)}'`);

        console.log("\n💡 After getting token, you can test protected endpoints:");
        console.log("   POST /api/v1/categories - Create category");
        console.log("   PUT /api/v1/categories/:id - Update category");
        console.log("   DELETE /api/v1/categories/:id - Delete category");
        console.log("   POST /api/v1/brands - Create brand");
        console.log("   PUT /api/v1/brands/:id - Update brand");
        console.log("   DELETE /api/v1/brands/:id - Delete brand");
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

createAdminAndToken();
