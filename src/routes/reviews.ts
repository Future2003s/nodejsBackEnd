import { Router } from "express";
import { protect, authorize } from "../middleware/auth";
import { validateReview } from "../middleware/validation";
import {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getProductReviewStats,
    moderateReview,
    markReviewHelpful,
    getUserReviews,
    getReviewsByRating
} from "../controllers/reviewController";

const router = Router();

// Public routes
router.get("/product/:productId/stats", getProductReviewStats);
router.get("/product/:productId", getProductReviews);
router.get("/rating/:rating", getReviewsByRating);
router.get("/", getReviews);
router.get("/:id", getReview);
router.put("/:id/helpful", markReviewHelpful);

// Protected routes
router.post("/", protect, validateReview, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.get("/user/me", protect, getUserReviews);

// Admin routes
router.put("/:id/moderate", protect, authorize("admin"), moderateReview);

export default router;
