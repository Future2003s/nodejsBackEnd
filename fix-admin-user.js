const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

async function fixAdminUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Find existing admin user
        const existingUser = await mongoose.connection.db.collection("users").findOne({ email: "admin@example.com" });

        if (existingUser) {
            console.log("👤 Found existing admin user, updating password...");

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin123", salt);

            // Update user with password
            await mongoose.connection.db.collection("users").updateOne(
                { email: "admin@example.com" },
                {
                    $set: {
                        password: hashedPassword,
                        updatedAt: new Date()
                    }
                }
            );

            console.log("✅ Admin user password updated successfully");
        } else {
            console.log("👤 Creating new admin user...");

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin123", salt);

            // Create new admin user
            await mongoose.connection.db.collection("users").insertOne({
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
                password: hashedPassword,
                role: "ADMIN",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log("✅ New admin user created successfully");
        }

        // Verify the user
        const updatedUser = await mongoose.connection.db.collection("users").findOne({ email: "admin@example.com" });
        console.log("\n📋 Admin User Details:");
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Password: admin123 (hashed: ${updatedUser.password ? "Yes" : "No"})`);
        console.log(`   Role: ${updatedUser.role}`);
        console.log(`   ID: ${updatedUser._id}`);

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

fixAdminUser();
