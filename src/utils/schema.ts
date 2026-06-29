import { z } from "zod";
import { EMAIL, PASSWORD } from "../constants/regexp.constant.js";

export const email = z
  .string()
  .min(1, { message: "Email is required" })
  .refine((email) => EMAIL.test(email), {
    message: "Please enter a valid email address",
  })
  .transform((email) => email.toLowerCase().trim());

export const password = z
  .string()
  .min(1, { message: "Password is required" })
  .refine((password) => PASSWORD.test(password), {
    message:
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
  });

export const registration = z.object({
  email,
  password,
});

export const login = z.object({
  email,
  password,
});

export type Registration = z.infer<typeof registration>;
export type Login = z.infer<typeof login>;
