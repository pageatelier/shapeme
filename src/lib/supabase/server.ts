import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component — safe to ignore when
            // middleware is refreshing the session
          }
        },
      },
    },
  );
}

/**
 * The current user, memoized per-request via React's `cache()` — every
 * Server Component that calls this within the same request (the main
 * layout plus whichever page it wraps) shares one `getUser()` call instead
 * of each re-validating the session against Supabase's Auth server on its
 * own. `getUser()` (not `getSession()`) is deliberate: it round-trips to
 * Supabase to verify the token instead of trusting the local cookie,
 * which is the security-recommended way to check auth in server code —
 * this only removes the *duplicate* round-trips within one request, not
 * the verification itself.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
