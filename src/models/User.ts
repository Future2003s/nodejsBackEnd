import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    avatar?: string;
    role: "customer" | "admin" | "seller";
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    lastLogin?: Date;
    addresses: mongoose.Types.DocumentArray<{
        _id?: mongoose.Types.ObjectId;
        type: "home" | "work" | "other";
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        isDefault: boolean;
    }>;
    preferences: {
        language: string;
        currency: string;
        notifications: {
            email: boolean;
            sms: boolean;
            push: boolean;
        };
    };
    createdAt: Date;
    updatedAt: Date;

    // Methods
    matchPassword(enteredPassword: string): Promise<boolean>;
    getSignedJwtToken(): string;
    getRefreshToken(): string;
    generateEmailVerificationToken(): string;
    generatePasswordResetToken(): string;
}

const AddressSchema = new Schema({
    type: {
        type: String,
        enum: ["home", "work", "other"],
        default: "home"
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const UserSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: [true, "Please add a first name"],
            trim: true,
            maxlength: [50, "First name cannot be more than 50 characters"]
        },
        lastName: {
            type: String,
            required: [true, "Please add a last name"],
            trim: true,
            maxlength: [50, "Last name cannot be more than 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"]
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false
        },
        phone: {
            type: String,
            match: [/^\+?[1-9]\d{1,14}$/, "Please add a valid phone number"]
        },
        avatar: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ["customer", "admin", "seller"],
            default: "customer"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isEmailVerified: {
            type: Boolean,
            default: true
        },
        emailVerificationToken: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
        lastLogin: Date,
        addresses: [AddressSchema],
        preferences: {
            language: {
                type: String,
                enum: ["vi", "en", "ja"],
                default: "en"
            },
            currency: { type: String, default: "USD" },
            notifications: {
                email: { type: Boolean, default: true },
                sms: { type: Boolean, default: false },
                push: { type: Boolean, default: true }
            }
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 for better security
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id.toString() }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    } as any);
};

// Generate refresh token
UserSchema.methods.getRefreshToken = function () {
    return jwt.sign({ id: this._id.toString() }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn
    } as any);
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function () {
    const crypto = require("crypto");
    const verificationToken = crypto.randomBytes(32).toString("hex");

    this.emailVerificationToken = verificationToken;
    return verificationToken;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function () {
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = resetToken;
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return resetToken;
};

export const User = mongoose.model<IUser>("User", UserSchema);
