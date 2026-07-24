import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client authenticated with the service role key.
 * Bypasses RLS — never import this into client components, and only use it
 * for privileged operations (Storage reads/writes on behalf of an already
 * ownership-checked request).
 */
const globalForSupabaseAdmin = globalThis as unknown as {
  supabaseAdmin?: SupabaseClient;
};

export function getSupabaseAdmin(): SupabaseClient {
  if (!globalForSupabaseAdmin.supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to use Supabase Storage.",
      );
    }

    globalForSupabaseAdmin.supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return globalForSupabaseAdmin.supabaseAdmin;
}

export const CASE_FILES_BUCKET = "case-files";
