import { z } from 'zod';

export const uploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type), 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed')
});

export const commentSchema = z.object({
  designId: z.string().uuid('Invalid design ID'),
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
  authorName: z.string().min(1).max(100).trim(),
  content: z.string().min(1).max(1000).trim(),
});

export const designSchema = z.object({
  fileName: z.string().min(1).max(255),
  isPublic: z.boolean().optional(),
});

export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(1).max(100).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1),
});

export type UploadInput = z.infer<typeof uploadSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type DesignInput = z.infer<typeof designSchema>;
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError.message);
    }
    throw error;
  }
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
