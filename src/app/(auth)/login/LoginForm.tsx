"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { AuthField } from "@/components/auth/AuthField";
import { ChevronLeftIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  // Email/password stays collapsed behind "Continue with email" so the
  // initial screen is Apple/Google-first and the card stays short — the
  // photo, not the form, is meant to dominate the screen.
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Google is registered in Supabase + Google Cloud now, so this does a
  // real signInWithOAuth() — it redirects the whole page to Google, then
  // Google/Supabase redirect back to /auth/callback (see that route) to
  // exchange the code for a session before landing on `next`. Apple stays
  // the AccountCreationStep-style stub until its own credentials exist.
  async function handleOAuth(provider: "apple" | "google") {
    if (provider === "apple") {
      setOauthError("Apple sign-in isn't set up yet — use email for now.");
      return;
    }
    setOauthError(null);
    const supabase = createClient();
    const next = searchParams.get("next") ?? "/";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setOauthError(error.message);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    router.push(searchParams.get("next") ?? "/");
    router.refresh();
  }

  return (
    // No mt-auto here anymore — the group sits wherever .app-content's own
    // justify-center puts it (roughly vertical middle), which is what
    // leaves the photo visible both above the wordmark AND below the card,
    // instead of pinning the whole group flush to the bottom.
    <div className="relative flex flex-col gap-3">
      {/* fixed (not absolute) so it covers the full viewport height instead
          of just this form's own content box — .app-content centers its
          child vertically (justify-center), so an absolute layer scoped to
          that child would only span the form's height, not the page.
          Horizontally centered + capped at the same 480px the mobile-frame
          .app-shell uses, so it lines up with the shell instead of the full
          browser window on wide desktop screens. -z-10 keeps it behind this
          normal-flow content — .app-content is a stacking context (it sets
          its own z-index), so this negative z-index is scoped to that
          context rather than fighting the whole page. */}
      <div className="pointer-events-none fixed inset-0 left-1/2 z-[-1] w-full max-w-[var(--container-sm)] -translate-x-1/2">
        <Image
          src="/login-bg.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
          style={{ objectPosition: "center 20%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(33,31,28,0.1) 0%, rgba(33,31,28,0.55) 55%, rgba(33,31,28,0.88) 100%)",
          }}
        />
      </div>

      <div className="text-center">
        <BrandLogo light hideIcon />
        <p className="font-bodoni text-[40px] leading-[1.05] text-white/90">
          Your body,
          <br />
          <span className="italic">taking shape.</span>
        </p>
      </div>

      {/* No extra margin here anymore — the outer gap-4 (plus mt-auto on
          the whole group above) does all the positioning now that logo,
          tagline, and card move together as one bottom-anchored unit.
          Padding/gap trimmed down (p-3/gap-2) and social buttons dropped to
          a 44px min-height (still meets the 44pt tap-target minimum) so the
          card stays short on the initial, email-collapsed screen — the
          photo, not the form, is meant to dominate. Background dropped to
          80% alpha + a backdrop blur for an actual frosted-glass look (a
          solid ~87%-opaque card reads as a generic login panel dropped onto
          the photo) — the blur is what keeps the lower opacity from making
          the "Email"/"Password" labels noisy against the busy photo;
          AuthField's own inputs stay on their normal near-opaque
          var(--surface-card), untouched. */}
      <div
        className="glass-card flex flex-col gap-2 p-3"
        style={{
          background: "rgba(251, 250, 247, 0.8)",
          backdropFilter: "blur(14px) saturate(1.15)",
          WebkitBackdropFilter: "blur(14px) saturate(1.15)",
        }}
      >
        {/* Same non-functional stub as onboarding's AccountCreationStep —
            see handleOAuth's doc comment above for why. */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="flex min-h-11 items-center justify-center rounded-full text-[14px] font-semibold text-text-primary"
            style={{ background: "var(--surface-card)", border: "var(--border-soft)" }}
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            className="flex min-h-11 items-center justify-center rounded-full text-[14px] font-semibold text-text-inverse"
            style={{ background: "var(--color-ink)" }}
          >
            Continue with Apple
          </button>
          {oauthError && <p className="text-center text-[12px] text-error">{oauthError}</p>}
        </div>

        {/* Email/password collapsed behind this single line by default —
            tapping it swaps this button out for the form in place, still
            inside the same card, rather than navigating anywhere. */}
        {showEmailForm ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              className="flex items-center gap-0.5 self-start py-1 text-[12px] font-semibold text-text-muted"
            >
              <ChevronLeftIcon className="h-3 w-3" />
              Back
            </button>
            <AuthField
              label="Email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AuthField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-[13px] text-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex min-h-11 items-center justify-center rounded-full text-[14px] font-bold text-text-inverse disabled:opacity-60"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
            >
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="py-1 text-center text-[13px] font-semibold text-text-secondary"
          >
            Continue with email
          </button>
        )}

        <p className="text-center text-[13px] text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-pink-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
