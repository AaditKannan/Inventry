import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().optional(),
  MAPBOX_TOKEN: z.string().optional(),
  INVENTRY_FROM_EMAIL: z.string().email().default("notifications@inventry.app"),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
