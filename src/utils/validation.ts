import mongoose from "mongoose";

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param id - The string to validate
 * @returns boolean - True if valid ObjectId, false otherwise
 */
export const validateObjectId = (id: string): boolean => {
    if (!id || typeof id !== "string") {
        return false;
    }
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate if a string is a valid email format
 * @param email - The email string to validate
 * @returns boolean - True if valid email, false otherwise
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate if a string is a valid phone number (Vietnamese format)
 * @param phone - The phone string to validate
 * @returns boolean - True if valid phone, false otherwise
 */
export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate if a string is a valid URL
 * @param url - The URL string to validate
 * @returns boolean - True if valid URL, false otherwise
 */
export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate if a string is a valid SKU format
 * @param sku - The SKU string to validate
 * @returns boolean - True if valid SKU, false otherwise
 */
export const validateSku = (sku: string): boolean => {
    const skuRegex = /^[A-Z0-9-_]+$/;
    return skuRegex.test(sku);
};

/**
 * Validate if a number is within a specified range
 * @param value - The number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns boolean - True if within range, false otherwise
 */
export const validateRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
};

/**
 * Validate if a string length is within specified bounds
 * @param str - The string to validate
 * @param minLength - Minimum length (inclusive)
 * @param maxLength - Maximum length (inclusive)
 * @returns boolean - True if within bounds, false otherwise
 */
export const validateStringLength = (str: string, minLength: number, maxLength: number): boolean => {
    if (!str || typeof str !== "string") {
        return false;
    }
    return str.length >= minLength && str.length <= maxLength;
};

/**
 * Validate if a string contains only alphanumeric characters
 * @param str - The string to validate
 * @returns boolean - True if alphanumeric only, false otherwise
 */
export const validateAlphanumeric = (str: string): boolean => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(str);
};

/**
 * Validate if a string contains only letters and spaces
 * @param str - The string to validate
 * @returns boolean - True if letters and spaces only, false otherwise
 */
export const validateLettersAndSpaces = (str: string): boolean => {
    const lettersAndSpacesRegex = /^[a-zA-Z\s]+$/;
    return lettersAndSpacesRegex.test(str);
};

/**
 * Validate if a string is a valid Vietnamese name
 * @param name - The name string to validate
 * @returns boolean - True if valid Vietnamese name, false otherwise
 */
export const validateVietnameseName = (name: string): boolean => {
    const vietnameseNameRegex =
        /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;
    return vietnameseNameRegex.test(name);
};

/**
 * Validate if a string is a valid password (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
 * @param password - The password string to validate
 * @returns boolean - True if valid password, false otherwise
 */
export const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

/**
 * Validate if a string is a valid date string
 * @param dateStr - The date string to validate
 * @returns boolean - True if valid date, false otherwise
 */
export const validateDate = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate if a string is a valid JSON string
 * @param jsonStr - The JSON string to validate
 * @returns boolean - True if valid JSON, false otherwise
 */
export const validateJson = (jsonStr: string): boolean => {
    try {
        JSON.parse(jsonStr);
        return true;
    } catch {
        return false;
    }
};

/**
 * Sanitize a string by removing HTML tags and dangerous characters
 * @param str - The string to sanitize
 * @returns string - The sanitized string
 */
export const sanitizeString = (str: string): string => {
    if (!str || typeof str !== "string") {
        return "";
    }

    return str
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/[<>]/g, "") // Remove remaining < and >
        .replace(/javascript:/gi, "") // Remove javascript: protocol
        .replace(/on\w+=/gi, "") // Remove event handlers
        .trim();
};

/**
 * Normalize a string for search (remove accents, convert to lowercase)
 * @param str - The string to normalize
 * @returns string - The normalized string
 */
export const normalizeString = (str: string): string => {
    if (!str || typeof str !== "string") {
        return "";
    }

    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s]/g, " ") // Replace special chars with spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim();
};

/**
 * Generate a random string of specified length
 * @param length - The length of the random string
 * @returns string - The random string
 */
export const generateRandomString = (length: number = 8): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generate a random SKU with prefix
 * @param prefix - The prefix for the SKU
 * @param length - The length of the random part
 * @returns string - The generated SKU
 */
export const generateSku = (prefix: string = "SKU", length: number = 6): string => {
    const randomPart = generateRandomString(length).toUpperCase();
    return `${prefix}-${randomPart}`;
};
