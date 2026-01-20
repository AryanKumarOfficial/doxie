import {z} from "zod";

export const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(8, {message: "Password must be at least 8 characters"}),
    name: z.string().optional()
});

export type RegisterSchema = z.infer<typeof registerSchema>;