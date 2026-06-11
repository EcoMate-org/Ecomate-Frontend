import { z } from "zod";

/**
 * Shared field validators
 */
const email = z.email("Enter a valid email address");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters");

/**
 * Login
 */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * USER registration
 * Role is automatically set to USER.
 */
export const userSignupSchema = z.object({
  role: z.literal("USER"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email,
  password,
});

/**
 * NGO registration
 */
export const ngoSignupSchema = z.object({
  role: z.literal("NGO"),
  companyName: z.string().trim().min(1, "Company name is required"),
  registrationNumber: z.string().trim().min(1, "Registration number is required"),
  companyAddress: z.string().trim().min(1, "Company address is required"),
  email,
  password,
});

/**
 * COMPANY registration
 */
export const companySignupSchema = z.object({
  role: z.literal("COMPANY"),
  companyName: z.string().trim().min(1, "Company name is required"),
  registrationNumber: z.string().trim().min(1, "Registration number is required"),
  companyAddress: z.string().trim().min(1, "Company address is required"),
  email,
  password,
});

/**
 * Discriminated union over the `role` field so the correct fields are
 * required/validated depending on the account type being created.
 */
export const signupSchema = z.discriminatedUnion("role", [
  userSignupSchema,
  ngoSignupSchema,
  companySignupSchema,
]);

export type SignupInput = z.infer<typeof signupSchema>;
export type UserSignupInput = z.infer<typeof userSignupSchema>;
export type OrganizationSignupInput =
  | z.infer<typeof ngoSignupSchema>
  | z.infer<typeof companySignupSchema>;
