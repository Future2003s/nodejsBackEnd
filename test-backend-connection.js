const axios = require("axios");

const BASE_URL = "http://localhost:8081";

async function testBackendConnection() {
    console.log("🔍 Testing backend connection...");

    try {
        // Test basic health check
        console.log("\n1. Testing health endpoint...");
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log("✅ Health check:", healthResponse.status === 200 ? "Success" : "Failed");
        console.log("   Response:", healthResponse.data);

        // Test products endpoint
        console.log("\n2. Testing products endpoint...");
        const productsResponse = await axios.get(`${BASE_URL}/api/v1/products?page=0&size=5`);
        console.log("✅ Products endpoint:", productsResponse.status === 200 ? "Success" : "Failed");
        console.log("   Status:", productsResponse.status);
        console.log("   Data structure:", Object.keys(productsResponse.data));

        if (productsResponse.data?.data?.content) {
            console.log("   Products found:", productsResponse.data.data.content.length);
            if (productsResponse.data.data.content.length > 0) {
                console.log("   Sample product:", {
                    id: productsResponse.data.data.content[0]._id,
                    name: productsResponse.data.data.content[0].name,
                    price: productsResponse.data.data.content[0].price
                });
            }
        }

        // Test categories endpoint
        console.log("\n3. Testing categories endpoint...");
        const categoriesResponse = await axios.get(`${BASE_URL}/api/v1/categories`);
        console.log("✅ Categories endpoint:", categoriesResponse.status === 200 ? "Success" : "Failed");
        console.log("   Status:", categoriesResponse.status);

        // Test brands endpoint
        console.log("\n4. Testing brands endpoint...");
        const brandsResponse = await axios.get(`${BASE_URL}/api/v1/brands`);
        console.log("✅ Brands endpoint:", brandsResponse.status === 200 ? "Success" : "Failed");
        console.log("   Status:", brandsResponse.status);

        console.log("\n🎉 Backend connection test completed successfully!");
    } catch (error) {
        console.error("\n❌ Backend connection test failed:");

        if (error.code === "ECONNREFUSED") {
            console.error("   Connection refused. Backend might not be running.");
            console.error("   Please start the backend with: npm run dev");
        } else if (error.response) {
            console.error(`   HTTP Error ${error.response.status}:`, error.response.data);
        } else {
            console.error("   Error:", error.message);
        }

        console.log("\n🔧 Troubleshooting steps:");
        console.log("   1. Make sure backend is running on port 8081");
        console.log("   2. Check if MongoDB is running");
        console.log("   3. Check backend console for errors");
        console.log("   4. Verify environment variables");
    }
}

// Run the test
testBackendConnection();
