import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth redirect target for signInWithOAuth() — Google sends the browser
 * back here (via Supabase) with a `code` param once the user approves.
 * exchangeCodeForSession() is what actually establishes the session cookie
 * (signInWithOAuth() itself only kicks off the redirect); without this
 * route, the browser would come back from Google with no session at all.
 * `next` carries where to land afterward — LoginForm forwards its own
 * `?next=` search param through here, AccountCreationStep points this at
 * `/onboarding` so the guest-draft resume logic picks up the same way the
 * email confirmation link's emailRedirectTo already does.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
