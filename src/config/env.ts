import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000").transform(Number),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().optional(),
  REDIS_URL: z.string(),
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
  },
  redis: {
    url: env.data.REDIS_URL,
  },
  isProduction: env.data.NODE_ENV === "production",
  isDevelopment: env.data.NODE_ENV === "development",
} as const;

export const isDevelopment = () => config.isDevelopment;
export const isProduction = () => config.isProduction;

export type Config = typeof config;
