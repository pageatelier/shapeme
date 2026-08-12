import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — full DB/Storage/Auth-admin access, bypassing RLS.
 * Only import this from Server Actions ("use server") or Server Components
 * — never from a "use client" file, since the key must never reach the
 * browser bundle.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY isn't set on the server.");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
