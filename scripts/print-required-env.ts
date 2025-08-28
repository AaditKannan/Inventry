#!/usr/bin/env tsx

import { z } from "zod";

const requiredEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const optionalEnvSchema = z.object({
  RESEND_API_KEY: z.string().optional(),
  MAPBOX_TOKEN: z.string().optional(),
  INVENTRY_FROM_EMAIL: z.string().email().optional(),
});

export function validateEnv() {
  const requiredEnv = requiredEnvSchema.safeParse(process.env);
  const optionalEnv = optionalEnvSchema.safeParse(process.env);

  if (!requiredEnv.success) {
    console.error("❌ Missing required environment variables:");
    console.error(requiredEnv.error.format());
    process.exit(1);
  }

  if (!optionalEnv.success) {
    console.warn("⚠️  Some optional environment variables are invalid:");
    console.warn(optionalEnv.error.format());
  }

  console.log("✅ Environment validation passed");
  return { ...requiredEnv.data, ...optionalEnv.data };
}

if (require.main === module) {
  validateEnv();
}
