"use client";

import { useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { createClient } from "@/lib/supabase/client";

/**
 * Account creation, deferred all the way to right before anything needs to
 * be saved — everything up to this point lived only in the guest draft
 * (localStorage). Email signup mirrors (auth)/signup/page.tsx's own
 * handleSubmit exactly, just without that page's full-bleed photo
 * treatment (this renders mid-flow, inside the onboarding shell).
 *
 * Apple/Google intentionally do NOT call signInWithOAuth() yet: that call
 * doesn't fail in-place the way signUp() does — it immediately does a full
 * top-level redirect to Supabase's /authorize endpoint, and only THERE
 * (after leaving this app entirely) does "provider not enabled" come back,
 * as a raw unstyled JSON error page. With no provider registered yet, that
 * redirect can only ever fail, so showing a plain in-app "not set up yet"
 * message instead is strictly better than sending a guest to that page.
 * Swap handleOAuth back to a real signInWithOAuth() call once the user
 * registers Apple/Google credentials in Supabase's dashboard. onCreated
 * only fires for the email path today, and only when
 * signUp() returns an active session immediately (email confirmation
 * off) — if Supabase requires confirmation, this shows the same
 * check-your-email state the standalone signup page does. `emailRedirectTo`
 * points the confirmation link back at /onboarding, which is guest-reachable
 * (see proxy.ts's isOnboardingRoute exception) and — once GuestIntroFlow's
 * resume logic is in place — recognizes the still-present local draft
 * (stage "awaiting_auth") and picks up automatically once a session exists,
 * rather than restarting or landing in the legacy OnboardingFlow.
 * onAwaitingConfirmation lets the parent mark that resume point in the
 * draft before this component's own local checkEmail state takes over.
 */
export function AccountCreationStep({
  onCreated,
  onAwaitingConfirmation,
}: {
  onCreated: () => void;
  onAwaitingConfirmation: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      onCreated();
    } else {
      onAwaitingConfirmation();
      setCheckEmail(true);
    }
  }

  function handleOAuth(provider: "apple" | "google") {
    const label = provider === "apple" ? "Apple" : "Google";
    setOauthError(`${label} sign-in isn't set up yet — use email for now.`);
  }

  if (checkEmail) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-[15px] font-bold text-text-primary">Check your email</p>
        <p className="max-w-[280px] text-[13px] leading-relaxed text-text-secondary">
          We sent a confirmation link to {email}. Follow it, then log in to pick up right where you left off.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <p className="text-[13px] font-semibold text-text-secondary">Last step before we save this</p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-text-primary">Create your account</h1>
        <p className="mt-1.5 text-[12px] text-text-muted">
          So your first week doesn&apos;t disappear when you close the tab.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          className="flex min-h-[48px] items-center justify-center rounded-full text-[14px] font-semibold text-text-inverse"
          style={{ background: "var(--color-ink)" }}
        >
          Continue with Apple
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          className="flex min-h-[48px] items-center justify-center rounded-full text-[14px] font-semibold text-text-primary"
          style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
        >
          Continue with Google
        </button>
        {oauthError && <p className="text-center text-[12px] text-error">{oauthError}</p>}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-text-muted">
        <span className="h-px flex-1" style={{ background: "var(--glass-border)" }} />
        or with email
        <span className="h-px flex-1" style={{ background: "var(--glass-border)" }} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          label="Password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-[13px] text-error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
