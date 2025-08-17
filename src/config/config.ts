import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface DatabaseConfig {
    type: "mongodb" | "postgresql";
    uri: string;
    options?: any;
}

interface JWTConfig {
    secret: string;
    expiresIn: string | number;
    refreshSecret: string;
    refreshExpiresIn: string | number;
}

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
}

interface Config {
    nodeEnv: string;
    port: number;
    database: DatabaseConfig;
    jwt: JWTConfig;
    email: EmailConfig;
    redis: RedisConfig;
    cors: {
        origin: string | string[];
    };
    upload: {
        maxSize: number;
        allowedTypes: string[];
    };
    payment: {
        stripe: {
            secretKey: string;
            publishableKey: string;
            webhookSecret: string;
        };
        vnpay: {
            tmnCode: string;
            secretKey: string;
            url: string;
            returnUrl: string;
        };
    };
}

export const config: Config = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "8081", 10),

    database: {
        type: (process.env.DB_TYPE as "mongodb" | "postgresql") || "mongodb",
        uri: process.env.DATABASE_URI || "mongodb://localhost:27017/ShopDev",
        options: {
            // Optimized connection pool settings for maximum performance
            maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || "100", 10), // Increased for better concurrency
            minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || "10", 10), // Higher minimum for faster response
            maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME || "60000", 10), // Increased idle time
            serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT || "3000", 10), // Faster selection
            socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || "30000", 10), // Reduced timeout
            connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || "10000", 10), // Connection timeout
            maxConnecting: parseInt(process.env.DB_MAX_CONNECTING || "10", 10), // Max concurrent connections

            // Performance optimizations (removed deprecated options)

            // Compression for network traffic
            compressors: ["zlib"],
            zlibCompressionLevel: parseInt(process.env.DB_COMPRESSION_LEVEL || "6", 10),

            // Read preferences for better performance
            readPreference: process.env.DB_READ_PREFERENCE || "secondaryPreferred",

            // Write concern for better performance (adjust based on consistency needs)
            writeConcern: {
                w: parseInt(process.env.DB_WRITE_CONCERN_W || "1", 10),
                j: process.env.DB_WRITE_CONCERN_J === "true",
                wtimeout: parseInt(process.env.DB_WRITE_CONCERN_TIMEOUT || "5000", 10)
            },

            // Connection monitoring
            heartbeatFrequencyMS: parseInt(process.env.DB_HEARTBEAT_FREQUENCY || "10000", 10),

            // Retry settings
            retryWrites: process.env.DB_RETRY_WRITES !== "false",
            retryReads: process.env.DB_RETRY_READS !== "false"
        }
    },

    jwt: {
        secret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        refreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
    },

    email: {
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587", 10),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER || "",
            pass: process.env.EMAIL_PASS || ""
        }
    },

    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || "0", 10)
    },

    cors: {
        origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"]
    },

    upload: {
        maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || "10485760", 10), // 10MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"]
    },

    payment: {
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY || "",
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ""
        },
        vnpay: {
            tmnCode: process.env.VNPAY_TMN_CODE || "",
            secretKey: process.env.VNPAY_SECRET_KEY || "",
            url: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
            returnUrl: process.env.VNPAY_RETURN_URL || "http://localhost:3000/payment/return"
        }
    }
};

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "DATABASE_URI"];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error("Missing required environment variables:", missingEnvVars);
    if (process.env.NODE_ENV === "production") {
        process.exit(1);
    }
}
