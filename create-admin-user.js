const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    console.log('👤 Creating Admin User for Product CRUD Testing');
    console.log('🎯 Goal: Create admin user to test product management endpoints');
    console.log('=' .repeat(60));
    
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/ShopDev');
        console.log('✅ Connected to MongoDB');
        
        // Define User schema (simplified)
        const userSchema = new mongoose.Schema({
            firstName: String,
            lastName: String,
            email: String,
            password: String,
            phone: String,
            role: { type: String, default: 'customer' },
            isActive: { type: Boolean, default: true },
            createdAt: { type: Date, default: Date.now }
        });
        
        const User = mongoose.model('User', userSchema);
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin@shopdev.com' });
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);
            console.log(`   ID: ${existingAdmin._id}`);
        } else {
            // Create admin user
            const hashedPassword = await bcrypt.hash('AdminPassword123!', 12);
            
            const adminUser = await User.create({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@shopdev.com',
                password: hashedPassword,
                phone: '+1234567890',
                role: 'admin',
                isActive: true
            });
            
            console.log('✅ Admin user created successfully');
            console.log(`   Email: ${adminUser.email}`);
            console.log(`   Role: ${adminUser.role}`);
            console.log(`   ID: ${adminUser._id}`);
        }
        
        // Also create a seller user for testing
        const existingSeller = await User.findOne({ email: 'seller@shopdev.com' });
        
        if (existingSeller) {
            console.log('✅ Seller user already exists');
            console.log(`   Email: ${existingSeller.email}`);
            console.log(`   Role: ${existingSeller.role}`);
        } else {
            const hashedPassword = await bcrypt.hash('SellerPassword123!', 12);
            
            const sellerUser = await User.create({
                firstName: 'Seller',
                lastName: 'User',
                email: 'seller@shopdev.com',
                password: hashedPassword,
                phone: '+1234567891',
                role: 'seller',
                isActive: true
            });
            
            console.log('✅ Seller user created successfully');
            console.log(`   Email: ${sellerUser.email}`);
            console.log(`   Role: ${sellerUser.role}`);
            console.log(`   ID: ${sellerUser._id}`);
        }
        
        // Show all users summary
        const allUsers = await User.find();
        console.log(`\n📊 Users Summary:`);
        console.log(`   Total Users: ${allUsers.length}`);
        
        const roleCount = {};
        allUsers.forEach(user => {
            roleCount[user.role] = (roleCount[user.role] || 0) + 1;
        });
        
        Object.entries(roleCount).forEach(([role, count]) => {
            console.log(`   ${role}: ${count}`);
        });
        
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Admin and Seller users ready!');
        console.log('📋 Credentials for testing:');
        console.log('   Admin: admin@shopdev.com / AdminPassword123!');
        console.log('   Seller: seller@shopdev.com / SellerPassword123!');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

// Run admin user creation
createAdminUser().catch(console.error);
