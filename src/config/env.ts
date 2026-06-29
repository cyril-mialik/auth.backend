import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000").transform(Number),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default("1h"),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("Invalid environment variables:");
  process.exit(1);
}

export const config = {
  env: env.data.NODE_ENV,
  port: env.data.PORT,
  jwt: {
    secret: env.data.JWT_SECRET,
    refreshSecret: env.data.JWT_REFRESH_SECRET || env.data.JWT_SECRET,
    expiresIn: env.data.JWT_EXPIRES_IN,
  },
  isProduction: env.data.NODE_ENV === "production",
  isDevelopment: env.data.NODE_ENV === "development",
  isTest: env.data.NODE_ENV === "test",
} as const;

export type Config = typeof config;
