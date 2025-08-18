import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { asyncHandler } from "../utils/asyncHandler";
import { ResponseHandler } from "../utils/response";

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password, phone } = req.body;

    const result = await AuthService.register({
        firstName,
        lastName,
        email,
        password,
        phone
    });

    ResponseHandler.authCreated(res, result, "User registered successfully.");
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    ResponseHandler.authSuccess(res, result, "Login successful");
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    const { refreshToken } = req.body;

    if (token) {
        // Blacklist the access token
        const { CacheWrapper } = await import("../utils/performance");
        const tokenBlacklist = new CacheWrapper("blacklist", 24 * 60 * 60); // 24 hours
        await tokenBlacklist.set(token, true);
    }

    if (refreshToken) {
        // Blacklist the refresh token
        const { CacheWrapper } = await import("../utils/performance");
        const refreshBlacklist = new CacheWrapper("blacklist", 7 * 24 * 60 * 60); // 7 days
        await refreshBlacklist.set(refreshToken, true);
    }

    ResponseHandler.success(res, null, "Logout successful");
});

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    const result = await AuthService.refreshToken(refreshToken);

    ResponseHandler.success(res, result, "Token refreshed successfully");
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await AuthService.forgotPassword(email);

    ResponseHandler.success(res, null, "Password reset email sent");
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password } = req.body;

    const result = await AuthService.resetPassword(token, password);

    ResponseHandler.success(res, result, "Password reset successful");
});

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;

    await AuthService.verifyEmail(token);

    ResponseHandler.success(res, null, "Email verified successfully");
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Public
export const resendVerification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await AuthService.resendVerification(email);

    ResponseHandler.success(res, null, "Verification email sent");
});

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    ResponseHandler.success(res, null, "Password changed successfully");
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await AuthService.getUserById(req.user.id);

    ResponseHandler.success(res, user, "User profile retrieved successfully");
});
