import { Router } from "express";
import { protect } from "../middleware/auth";
import { cartRateLimit } from "../middleware/rateLimiting";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    validateCart,
    mergeGuestCart,
    getCartItemCount
} from "../controllers/cartController";

const router = Router();

// Public routes (work with session ID for guest users) with rate limiting
router.get("/count", cartRateLimit, getCartItemCount);
router.get("/summary", cartRateLimit, getCartSummary);
router.get("/validate", cartRateLimit, validateCart);
router.get("/", cartRateLimit, getCart);
router.post("/items", cartRateLimit, addToCart);
router.put("/items/:productId", cartRateLimit, updateCartItem);
router.delete("/items/:productId", cartRateLimit, removeFromCart);
router.delete("/clear", cartRateLimit, clearCart);

// Protected routes (require authentication) with rate limiting
router.post("/merge", protect, cartRateLimit, mergeGuestCart);

export default router;
