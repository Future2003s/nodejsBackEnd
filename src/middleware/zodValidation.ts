import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ResponseHandler } from "../utils/response";

// Zod validation middleware
export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Parse and validate the request
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });

            // Replace request data with parsed/transformed data
            req.body = (parsed as any).body || req.body;
            req.query = (parsed as any).query || req.query;
            req.params = (parsed as any).params || req.params;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format Zod errors for better readability
                const formattedErrors = error.issues.map((err: any) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code
                }));

                return ResponseHandler.badRequest(res, "Validation failed", formattedErrors);
            }

            // Handle other errors
            return ResponseHandler.error(res, "Validation error", 500);
        }
    };
};

// Optional validation (doesn't fail if schema doesn't match)
export const optionalValidate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });

            req.body = (parsed as any).body || req.body;
            req.query = (parsed as any).query || req.query;
            req.params = (parsed as any).params || req.params;
        } catch (error) {
            // Silently continue without validation for optional validation
        }

        next();
    };
};

// Validate only specific parts of the request
export const validateBody = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync(req.body);
            req.body = parsed as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((err: any) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code
                }));

                return ResponseHandler.badRequest(res, "Body validation failed", formattedErrors);
            }

            return ResponseHandler.error(res, "Body validation error", 500);
        }
    };
};

export const validateQuery = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync(req.query);
            req.query = parsed as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((err: any) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code
                }));

                return ResponseHandler.badRequest(res, "Query validation failed", formattedErrors);
            }

            return ResponseHandler.error(res, "Query validation error", 500);
        }
    };
};

export const validateParams = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync(req.params);
            req.params = parsed as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((err: any) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code
                }));

                return ResponseHandler.badRequest(res, "Params validation failed", formattedErrors);
            }

            return ResponseHandler.error(res, "Params validation error", 500);
        }
    };
};
