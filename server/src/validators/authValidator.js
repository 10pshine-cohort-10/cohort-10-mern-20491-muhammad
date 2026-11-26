
import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters long")
        .max(30, "Name cannot exceed 30 characters"),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address")
        .max(100, "Email cannot exceed 100 characters"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .refine(
            (password) => Buffer.byteLength(password, "utf8") <= 72,
            "Password cannot exceed 72 bytes"
        ),
}).strict();

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address")
        .max(100, "Email cannot exceed 100 characters"),

    password: z
        .string()
        .min(1, "Password is required")
        .max(128, "Invalid credentials"),
}).strict();
