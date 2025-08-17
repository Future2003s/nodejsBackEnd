import { User, IUser } from "../models/User";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthResponse {
    user: Partial<IUser>;
    token: string;
    refreshToken: string;
}

export class AuthService {
    /**
     * Register a new user
     */
    static async register(userData: RegisterData): Promise<AuthResponse> {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                throw new AppError("User already exists with this email", 400);
            }

            // Create new user
            const user = await User.create(userData);

            // Generate email verification token
            const verificationToken = user.generateEmailVerificationToken();
            await user.save({ validateBeforeSave: false });

            // TODO: Send verification email
            logger.info(`User registered: ${userData.email}, verification token: ${verificationToken}`);

            // Generate tokens
            const token = user.getSignedJwtToken();
            const refreshToken = user.getRefreshToken();

            // Remove password from response
            const userResponse = user.toObject();
            const { password: _, ...userWithoutPassword } = userResponse;

            return {
                user: userWithoutPassword,
                token,
                refreshToken
            };
        } catch (error) {
            logger.error("Registration error:", error);
            throw error;
        }
    }

    /**
     * Login user
     */
    static async login(loginData: LoginData): Promise<AuthResponse> {
        try {
            const { email, password } = loginData;

            // Find user with password field
            const user = await User.findOne({ email }).select("+password");

            if (!user || !(await user.matchPassword(password))) {
                throw new AppError("Invalid credentials", 401);
            }

            // Check if user is active
            if (!user.isActive) {
                throw new AppError("Account is deactivated", 401);
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save({ validateBeforeSave: false });

            // Generate tokens
            const token = user.getSignedJwtToken();
            const refreshToken = user.getRefreshToken();

            // Remove password from response
            const userResponse = user.toObject();
            const { password: _, ...userWithoutPassword } = userResponse;

            return {
                user: userWithoutPassword,
                token,
                refreshToken
            };
        } catch (error) {
            logger.error("Login error:", error);
            throw error;
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<IUser> {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new AppError("User not found", 404);
            }

            return user;
        } catch (error) {
            logger.error("Get user error:", error);
            throw error;
        }
    }

    /**
     * Change user password
     */
    static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        try {
            const user = await User.findById(userId).select("+password");

            if (!user) {
                throw new AppError("User not found", 404);
            }

            // Verify current password
            if (!(await user.matchPassword(currentPassword))) {
                throw new AppError("Current password is incorrect", 400);
            }

            // Update password
            user.password = newPassword;
            await user.save();

            logger.info(`Password changed for user: ${user.email}`);
        } catch (error) {
            logger.error("Change password error:", error);
            throw error;
        }
    }

    /**
     * Forgot password - generate reset token
     */
    static async forgotPassword(email: string): Promise<string> {
        try {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AppError("No user found with that email", 404);
            }

            // Generate reset token
            const resetToken = user.generatePasswordResetToken();
            await user.save({ validateBeforeSave: false });

            // TODO: Send reset email
            logger.info(`Password reset requested for: ${email}, token: ${resetToken}`);

            return resetToken;
        } catch (error) {
            logger.error("Forgot password error:", error);
            throw error;
        }
    }

    /**
     * Reset password with token
     */
    static async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
        try {
            // Find user by reset token
            const user = await User.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() }
            });

            if (!user) {
                throw new AppError("Invalid or expired reset token", 400);
            }

            // Update password and clear reset token
            user.password = newPassword;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            // Generate new tokens
            const jwtToken = user.getSignedJwtToken();
            const refreshToken = user.getRefreshToken();

            // Remove password from response
            const userResponse = user.toObject();
            const { password: _, ...userWithoutPassword } = userResponse;

            logger.info(`Password reset successful for user: ${user.email}`);

            return {
                user: userWithoutPassword,
                token: jwtToken,
                refreshToken
            };
        } catch (error) {
            logger.error("Reset password error:", error);
            throw error;
        }
    }

    /**
     * Verify email with token
     */
    static async verifyEmail(token: string): Promise<void> {
        try {
            const user = await User.findOne({ emailVerificationToken: token });

            if (!user) {
                throw new AppError("Invalid verification token", 400);
            }

            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            await user.save({ validateBeforeSave: false });

            logger.info(`Email verified for user: ${user.email}`);
        } catch (error) {
            logger.error("Email verification error:", error);
            throw error;
        }
    }

    /**
     * Resend verification email
     */
    static async resendVerification(email: string): Promise<string> {
        try {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AppError("User not found", 404);
            }

            if (user.isEmailVerified) {
                throw new AppError("Email is already verified", 400);
            }

            const verificationToken = user.generateEmailVerificationToken();
            await user.save({ validateBeforeSave: false });

            // TODO: Send verification email
            logger.info(`Verification email resent to: ${email}, token: ${verificationToken}`);

            return verificationToken;
        } catch (error) {
            logger.error("Resend verification error:", error);
            throw error;
        }
    }

    /**
     * Refresh JWT token
     */
    static async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

            // Get user
            const user = await User.findById(decoded.id);
            if (!user || !user.isActive) {
                throw new AppError("Invalid refresh token", 401);
            }

            // Generate new tokens
            const newToken = user.getSignedJwtToken();
            const newRefreshToken = user.getRefreshToken();

            return {
                token: newToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            logger.error("Refresh token error:", error);
            throw new AppError("Invalid refresh token", 401);
        }
    }
}
