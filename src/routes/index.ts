import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import productRoutes from "./products";
import categoryRoutes from "./categories";
import brandRoutes from "./brands";
import orderRoutes from "./orders";
import cartRoutes from "./cart";
import reviewRoutes from "./reviews";
import adminRoutes from "./admin";
import performanceRoutes from "./performance";
import translationRoutes from "./translations";
import analyticsRoutes from "./analytics";
import path from "path";
import fs from "fs";

const router = Router();

// Home page route
router.get("/", (req, res) => {
    const indexPath = path.join(__dirname, "../views/index.html");

    if (fs.existsSync(indexPath)) {
        const indexHtml = fs.readFileSync(indexPath, "utf8");
        return res.type("html").send(indexHtml);
    }

    // Fallback if HTML file doesn't exist
    res.type("html").send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>ShopDev API</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #333; }
                p { color: #666; }
            </style>
        </head>
        <body>
            <h1>🛍️ ShopDev API</h1>
            <p>E-commerce API is running successfully!</p>
            <p><a href="/api/v1/health">Health Check</a></p>
        </body>
        </html>
    `);
});

// Test route (no database required)
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "API is working!",
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: {
                register: "POST /api/v1/auth/register",
                login: "POST /api/v1/auth/login",
                me: "GET /api/v1/auth/me (requires token)",
                changePassword: "PUT /api/v1/auth/change-password (requires token)"
            },
            users: {
                profile: "GET /api/v1/users/profile (requires token)",
                updateProfile: "PUT /api/v1/users/profile (requires token)",
                addresses: "GET /api/v1/users/addresses (requires token)"
            }
        }
    });
});

// API Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/orders", orderRoutes);
router.use("/cart", cartRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);
router.use("/performance", performanceRoutes);
router.use("/translations", translationRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
