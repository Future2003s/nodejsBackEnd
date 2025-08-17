import { Router } from "express";
import { protect } from "../middleware/auth";
import { authRateLimit, generalRateLimit } from "../middleware/rateLimiting";
import { staticDataCache } from "../middleware/compression";
import {
    validateRegister,
    validateLogin,
    validateChangePassword,
    validateForgotPassword,
    validateResetPassword
} from "../middleware/validation";
import {
    changePassword,
    forgotPassword,
    getMe,
    login,
    logout,
    refreshToken,
    register,
    resendVerification,
    resetPassword,
    verifyEmail
} from "../controllers/authController";

const router = Router();

// Public routes with rate limiting
router.post("/register", authRateLimit, validateRegister, register);
router.post("/login", authRateLimit, validateLogin, login);
router.post("/logout", generalRateLimit, logout);
router.post("/refresh-token", authRateLimit, refreshToken);
router.post("/forgot-password", authRateLimit, validateForgotPassword, forgotPassword);
router.put("/reset-password/:token", authRateLimit, validateResetPassword, resetPassword);
router.get("/verify-email/:token", generalRateLimit, verifyEmail);
router.post("/resend-verification", authRateLimit, resendVerification);

// Protected routes with optimized middleware
router.get("/me", protect, getMe);
router.put("/change-password", protect, authRateLimit, validateChangePassword, changePassword);

export default router;
