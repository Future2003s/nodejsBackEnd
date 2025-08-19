const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:8081/api/v1";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "your_admin_token_here";

// Test data
const testProduct = {
    name: "Test Product",
    description: "This is a test product for testing purposes",
    sku: "TEST-PRODUCT-001",
    price: 1000000,
    basePrice: 1000000,
    stock: 50,
    minStock: 10,
    maxStock: 100,
    categoryId: "507f1f77bcf86cd799439011", // Replace with actual category ID
    brandId: "507f1f77bcf86cd799439012", // Replace with actual brand ID
    thumbnail: "https://via.placeholder.com/400x400/000000/FFFFFF?text=Test+Product",
    images: ["https://via.placeholder.com/400x400/000000/FFFFFF?text=Test+Product+1"],
    tags: ["test", "sample"],
    specifications: {
        "Test Field": "Test Value",
        "Another Field": "Another Value"
    },
    weight: 100,
    dimensions: {
        length: 10,
        width: 5,
        height: 2
    }
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, endpoint, data = null, token = ADMIN_TOKEN) => {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`❌ Error ${error.response.status}:`, error.response.data);
            return error.response.data;
        } else {
            console.error("❌ Network error:", error.message);
            return null;
        }
    }
};

// Test functions
const testPublicEndpoints = async () => {
    console.log("\n🔍 Testing Public Endpoints...");

    try {
        // Test get all products
        console.log("\n1. Testing GET /products...");
        const productsResponse = await axios.get(`${BASE_URL}/products?page=0&size=5`);
        console.log("✅ Get products:", productsResponse.data.success ? "Success" : "Failed");
        console.log(`   Found ${productsResponse.data.data?.content?.length || 0} products`);

        // Test get product by ID (if products exist)
        if (productsResponse.data.data?.content?.length > 0) {
            const firstProduct = productsResponse.data.data.content[0];
            console.log("\n2. Testing GET /products/:id...");
            const productResponse = await axios.get(`${BASE_URL}/products/${firstProduct._id}`);
            console.log("✅ Get product by ID:", productResponse.data.success ? "Success" : "Failed");
        }

        // Test search products
        console.log("\n3. Testing GET /products/search...");
        const searchResponse = await axios.get(`${BASE_URL}/products/search?q=test`);
        console.log("✅ Search products:", searchResponse.data.success ? "Success" : "Failed");
    } catch (error) {
        console.error("❌ Public endpoints test failed:", error.message);
    }
};

const testAdminEndpoints = async () => {
    console.log("\n🔐 Testing Admin Endpoints...");

    try {
        // Test get admin products
        console.log("\n1. Testing GET /products/admin/all...");
        const adminProductsResponse = await makeAuthRequest("GET", "/products/admin/all?page=0&size=5");
        console.log("✅ Get admin products:", adminProductsResponse?.success ? "Success" : "Failed");

        // Test create product
        console.log("\n2. Testing POST /products/create...");
        const createResponse = await makeAuthRequest("POST", "/products/create", testProduct);
        console.log("✅ Create product:", createResponse?.success ? "Success" : "Failed");

        if (createResponse?.success && createResponse?.data?._id) {
            const productId = createResponse.data._id;

            // Test update product
            console.log("\n3. Testing PUT /products/:id...");
            const updateData = { ...testProduct, name: "Updated Test Product", price: 1500000 };
            const updateResponse = await makeAuthRequest("PUT", `/products/${productId}`, updateData);
            console.log("✅ Update product:", updateResponse?.success ? "Success" : "Failed");

            // Test update product status
            console.log("\n4. Testing PATCH /products/:id/status...");
            const statusResponse = await makeAuthRequest("PATCH", `/products/${productId}/status`, {
                status: "INACTIVE"
            });
            console.log("✅ Update product status:", statusResponse?.success ? "Success" : "Failed");

            // Test update product stock
            console.log("\n5. Testing PATCH /products/:id/stock...");
            const stockResponse = await makeAuthRequest("PATCH", `/products/${productId}/stock`, {
                stock: 75,
                operation: "set"
            });
            console.log("✅ Update product stock:", stockResponse?.success ? "Success" : "Failed");

            // Test delete product
            console.log("\n6. Testing DELETE /products/:id...");
            const deleteResponse = await makeAuthRequest("DELETE", `/products/${productId}`);
            console.log("✅ Delete product:", deleteResponse?.success ? "Success" : "Failed");
        }
    } catch (error) {
        console.error("❌ Admin endpoints test failed:", error.message);
    }
};

const testAnalyticsEndpoints = async () => {
    console.log("\n📊 Testing Analytics Endpoints...");

    try {
        // Test product analytics overview
        console.log("\n1. Testing GET /products/admin/analytics/overview...");
        const overviewResponse = await makeAuthRequest("GET", "/products/admin/analytics/overview");
        console.log("✅ Product analytics overview:", overviewResponse?.success ? "Success" : "Failed");

        // Test stock analytics
        console.log("\n2. Testing GET /products/admin/analytics/stock...");
        const stockResponse = await makeAuthRequest("GET", "/products/admin/analytics/stock");
        console.log("✅ Stock analytics:", stockResponse?.success ? "Success" : "Failed");

        // Test category analytics
        console.log("\n3. Testing GET /products/admin/analytics/category...");
        const categoryResponse = await makeAuthRequest("GET", "/products/admin/analytics/category");
        console.log("✅ Category analytics:", categoryResponse?.success ? "Success" : "Failed");
    } catch (error) {
        console.error("❌ Analytics endpoints test failed:", error.message);
    }
};

const testUtilityEndpoints = async () => {
    console.log("\n🔧 Testing Utility Endpoints...");

    try {
        // Test get product statuses
        console.log("\n1. Testing GET /products/statuses...");
        const statusesResponse = await makeAuthRequest("GET", "/products/statuses");
        console.log("✅ Get product statuses:", statusesResponse?.success ? "Success" : "Failed");
        if (statusesResponse?.success) {
            console.log("   Available statuses:", statusesResponse.data.map((s) => s.value).join(", "));
        }
    } catch (error) {
        console.error("❌ Utility endpoints test failed:", error.message);
    }
};

const testBulkOperations = async () => {
    console.log("\n📦 Testing Bulk Operations...");

    try {
        // Test bulk create products
        console.log("\n1. Testing POST /products/bulk/create...");
        const bulkCreateData = {
            products: [
                { ...testProduct, sku: "BULK-TEST-001", name: "Bulk Test Product 1" },
                { ...testProduct, sku: "BULK-TEST-002", name: "Bulk Test Product 2" }
            ]
        };
        const bulkCreateResponse = await makeAuthRequest("POST", "/products/bulk/create", bulkCreateData);
        console.log("✅ Bulk create products:", bulkCreateResponse?.success ? "Success" : "Failed");

        if (bulkCreateResponse?.success) {
            const createdIds = bulkCreateResponse.data.created.map((p) => p._id);

            // Test bulk update products
            console.log("\n2. Testing POST /products/bulk/update...");
            const bulkUpdateData = {
                updates: createdIds.map((id) => ({
                    id,
                    price: 2000000,
                    stock: 100
                }))
            };
            const bulkUpdateResponse = await makeAuthRequest("POST", "/products/bulk/update", bulkUpdateData);
            console.log("✅ Bulk update products:", bulkUpdateResponse?.success ? "Success" : "Failed");

            // Test bulk delete products
            console.log("\n3. Testing POST /products/bulk/delete...");
            const bulkDeleteData = { ids: createdIds };
            const bulkDeleteResponse = await makeAuthRequest("POST", "/products/bulk/delete", bulkDeleteData);
            console.log("✅ Bulk delete products:", bulkDeleteResponse?.success ? "Success" : "Failed");
        }
    } catch (error) {
        console.error("❌ Bulk operations test failed:", error.message);
    }
};

const testErrorHandling = async () => {
    console.log("\n🚨 Testing Error Handling...");

    try {
        // Test invalid product ID
        console.log("\n1. Testing invalid product ID...");
        const invalidIdResponse = await axios.get(`${BASE_URL}/products/invalid-id`);
        console.log("✅ Invalid ID handling:", invalidIdResponse.status === 400 ? "Success" : "Failed");

        // Test invalid data for create product
        console.log("\n2. Testing invalid data for create product...");
        const invalidData = { name: "Test", price: -100 }; // Invalid price
        const invalidDataResponse = await makeAuthRequest("POST", "/products/create", invalidData);
        console.log("✅ Invalid data handling:", !invalidDataResponse?.success ? "Success" : "Failed");

        // Test unauthorized access
        console.log("\n3. Testing unauthorized access...");
        const unauthorizedResponse = await makeAuthRequest("GET", "/products/admin/all", null, "invalid-token");
        console.log("✅ Unauthorized access handling:", !unauthorizedResponse?.success ? "Success" : "Failed");
    } catch (error) {
        console.error("❌ Error handling test failed:", error.message);
    }
};

// Main test function
const runAllTests = async () => {
    console.log("🚀 Starting Products Backend Tests...");
    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log(`🔑 Admin Token: ${ADMIN_TOKEN ? "Provided" : "Not provided"}`);

    if (!ADMIN_TOKEN || ADMIN_TOKEN === "your_admin_token_here") {
        console.log("\n⚠️  Warning: Admin token not provided. Admin endpoint tests will fail.");
        console.log("   Set ADMIN_TOKEN environment variable or update the script.");
    }

    try {
        await testPublicEndpoints();
        await testAdminEndpoints();
        await testAnalyticsEndpoints();
        await testUtilityEndpoints();
        await testBulkOperations();
        await testErrorHandling();

        console.log("\n🎉 All tests completed!");
        console.log("\n📋 Test Summary:");
        console.log("   ✅ Public endpoints tested");
        console.log("   ✅ Admin endpoints tested");
        console.log("   ✅ Analytics endpoints tested");
        console.log("   ✅ Utility endpoints tested");
        console.log("   ✅ Bulk operations tested");
        console.log("   ✅ Error handling tested");
    } catch (error) {
        console.error("\n❌ Test execution failed:", error.message);
    }
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testPublicEndpoints,
    testAdminEndpoints,
    testAnalyticsEndpoints,
    testUtilityEndpoints,
    testBulkOperations,
    testErrorHandling,
    runAllTests
};
