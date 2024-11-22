import z from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long');

export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters long');

export const usernameOrEmailSchema = z
  .string()
  .min(4, 'Username must be at least 3 characters long.') // Username validation
  .or(z.string().email('Invalid email address'));

// Optionally create common or reusable schema objects for multiple forms
