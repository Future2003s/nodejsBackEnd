import { User, IUser } from "../models/User";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { CacheWrapper, QueryAnalyzer, performanceMonitor } from "../utils/performance";

// Create optimized cache instances for auth operations
const authCache = new CacheWrapper("auth", 300); // 5 minutes
const tokenBlacklistCache = new CacheWrapper("token_blacklist", 86400); // 24 hours
const rateLimitCache = new CacheWrapper("rate_limit", 900); // 15 minutes

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
     * Register a new user with optimized performance
     */
    static async register(userData: RegisterData): Promise<AuthResponse> {
        return QueryAnalyzer.analyzeQuery("AuthService.register", async () => {
            try {
                // Check if user already exists using cached method (no password needed)
                const existingUser = await (User as any).findByEmailCached(userData.email);
                if (existingUser) {
                    throw new AppError("User already exists with this email", 400);
                }

                // Create new user
                const user = await User.create(userData);

                // Log successful registration
                logger.info(`User registered: ${userData.email}`);

                // Generate tokens
                const token = user.getSignedJwtToken();
                const refreshToken = user.getRefreshToken();

                // Cache user session info for faster subsequent requests
                await authCache.set(`session:${user._id}`, {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    lastActivity: new Date()
                });

                // Remove password from response
                const userResponse = user.toObject();
                const { password: _, ...userWithoutPassword } = userResponse;

                // Record performance metrics
                performanceMonitor.recordCacheHit();

                return {
                    user: userWithoutPassword,
                    token,
                    refreshToken
                };
            } catch (error) {
                logger.error("Registration error:", error);
                performanceMonitor.recordCacheMiss();
                throw error;
            }
        });
    }

    /**
     * Login user with optimized performance and rate limiting
     */
    static async login(loginData: LoginData): Promise<AuthResponse> {
        return QueryAnalyzer.analyzeQuery("AuthService.login", async () => {
            try {
                const { email, password } = loginData;

                // Check rate limiting for failed login attempts
                const rateLimitKey = `login_attempts:${email}`;
                const attempts = Number((await rateLimitCache.get(rateLimitKey)) || 0);

                if (attempts >= 5) {
                    throw new AppError("Too many login attempts. Please try again later.", 429);
                }

                // Find user with password field for authentication
                const user = await (User as any).findByEmailForAuth(email);

                if (!user || !(await user.matchPassword(password))) {
                    // Increment failed login attempts
                    await rateLimitCache.set(rateLimitKey, attempts + 1, 900); // 15 minutes
                    throw new AppError("Invalid credentials", 401);
                }

                // Clear failed login attempts on successful login
                await rateLimitCache.del(rateLimitKey);

                // Check if user is active
                if (!user.isActive) {
                    throw new AppError("Account is deactivated", 401);
                }

                // Update last login asynchronously for better performance
                setImmediate(async () => {
                    try {
                        await User.findByIdAndUpdate(
                            user._id,
                            { lastLogin: new Date() },
                            { validateBeforeSave: false }
                        );
                    } catch (error) {
                        logger.error("Error updating last login:", error);
                    }
                });

                // Generate tokens
                const token = user.getSignedJwtToken();
                const refreshToken = user.getRefreshToken();

                // Cache user session info
                await authCache.set(`session:${user._id}`, {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    lastActivity: new Date()
                });

                // Remove password from response
                const userResponse = user.toObject();
                const { password: _, ...userWithoutPassword } = userResponse;

                // Record successful login
                logger.info(`User logged in: ${email}`);
                performanceMonitor.recordCacheHit();

                return {
                    user: userWithoutPassword,
                    token,
                    refreshToken
                };
            } catch (error) {
                logger.error("Login error:", error);
                performanceMonitor.recordCacheMiss();
                throw error;
            }
        });
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
     * Refresh JWT token with rotation and optimized performance
     */
    static async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
        return QueryAnalyzer.analyzeQuery("AuthService.refreshToken", async () => {
            try {
                // Check if token is blacklisted first (faster than JWT verification)
                const isBlacklisted = await tokenBlacklistCache.get(refreshToken);
                if (isBlacklisted) {
                    throw new AppError("Token has been revoked", 401);
                }

                // Verify refresh token
                const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

                // Get user using cached method
                const user = await (User as any).findByIdCached(decoded.id);
                if (!user || !user.isActive) {
                    throw new AppError("Invalid refresh token", 401);
                }

                // Blacklist the old refresh token to prevent reuse
                await tokenBlacklistCache.set(refreshToken, true);

                // Generate new tokens (both access and refresh)
                const newToken = user.getSignedJwtToken();
                const newRefreshToken = user.getRefreshToken();

                // Update session cache
                await authCache.set(`session:${user._id}`, {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    lastActivity: new Date()
                });

                logger.info(`Token refreshed for user: ${user.email}`);
                performanceMonitor.recordCacheHit();

                return {
                    token: newToken,
                    refreshToken: newRefreshToken
                };
            } catch (error) {
                logger.error("Refresh token error:", error);
                performanceMonitor.recordCacheMiss();
                throw new AppError("Invalid refresh token", 401);
            }
        });
    }
}
