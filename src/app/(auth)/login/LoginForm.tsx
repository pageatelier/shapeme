"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { AuthField } from "@/components/auth/AuthField";
import { ChevronLeftIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { checkEmailExists } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";

type Step = "initial" | "email" | "password-existing" | "password-new" | "verify-sent";

const PASSWORD_MIN_LENGTH = 8;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("initial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // Google is registered in Supabase + Google Cloud now, so this does a
  // real signInWithOAuth() — it redirects the whole page to Google, then
  // Google/Supabase redirect back to /auth/callback (see that route) to
  // exchange the code for a session before landing on `next`. Apple stays
  // a stub until its own credentials exist. Both providers handle sign-in
  // AND account creation automatically — there's no separate "sign up with
  // Google" path to build.
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

  // The one moment the user picks a path is here — not a separate "log in"
  // vs "sign up" choice up front. checkEmailExists() (a Server Action; the
  // lookup needs the service-role key) decides which password step to show
  // next.
  async function handleEmailContinue(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const exists = await checkEmailExists(email);
      setStep(exists ? "password-existing" : "password-new");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: FormEvent) {
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

  async function handleCreateAccount(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Use at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
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
    // Same anti-enumeration quirk as elsewhere: signUp() on an already-
    // registered email "succeeds" with no session and an empty identities
    // array instead of erroring. checkEmailExists() should have already
    // routed this email to the existing-account step, so landing here is
    // an edge case (the account was created in the gap between the two
    // calls) rather than the common path.
    if (data.user && data.user.identities?.length === 0) {
      setError("An account with this email already exists. Try logging in instead.");
      return;
    }
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }
    setStep("verify-sent");
  }

  async function handleResend() {
    setResending(true);
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    setResent(true);
  }

  async function handleForgotPassword() {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/login`,
    });
    setForgotSent(true);
  }

  function goTo(target: Step) {
    setError(null);
    setStep(target);
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="flex h-9 w-9 items-center justify-center text-text-muted"
    >
      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
    </button>
  );

  return (
    // No mt-auto here — the group sits wherever .app-content's own
    // justify-center puts it (roughly vertical middle), which is what
    // leaves the photo visible both above the wordmark AND below the card,
    // instead of pinning the whole group flush to the bottom. That
    // centering no longer reshuffles when the keyboard opens — see
    // layout.tsx's viewport.interactiveWidget: "overlays-content".
    <div className="relative flex flex-col gap-5">
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
      {/* top-0 + .onboarding-fixed-bg (not inset-0) — on iOS Safari, a
          `fixed` box sized via inset-0's implicit top:0/bottom:0, or even
          a single height:100dvh, can end up shorter than the visible
          viewport while the address bar is in its expanded state, leaving
          a sliver of the page's own cream background showing above/below
          the photo. See that class in globals.css for the fallback chain
          that closes the gap for good. */}
      <div className="onboarding-fixed-bg pointer-events-none fixed top-0 left-1/2 z-[-1] w-full max-w-[var(--container-sm)] -translate-x-1/2">
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
        <BrandLogo light hideIcon textClassName="text-[22px]" />
        <p
          className="font-bodoni text-[43px] text-white/90"
          style={{ fontWeight: 400, letterSpacing: "-0.045em", lineHeight: 0.88 }}
        >
          Your body,
          <br />
          <span className="italic">taking shape.</span>
        </p>
      </div>

      {/* Padding/gap trimmed down (p-3/gap-2) and social buttons at a 44px
          min-height (still meets the 44pt tap-target minimum) so the card
          stays short on the initial screen — the photo, not the form, is
          meant to dominate. Background dropped to 80% alpha + a backdrop
          blur for an actual frosted-glass look (a solid ~87%-opaque card
          reads as a generic login panel dropped onto the photo) — the blur
          is what keeps the lower opacity from making the "Email"/"Password"
          placeholders noisy against the busy photo; AuthField's own inputs
          stay on their normal near-opaque var(--surface-card), untouched.
          Every step below replaces this card's contents outright (no
          accordion/expand) — no `autoFocus` or imperative `.focus()`
          anywhere in this file, so switching steps never opens the
          keyboard on its own; it only opens when the user taps a field
          themselves. */}
      <div
        className="glass-card flex flex-col gap-2 p-3"
        style={{
          background: "rgba(251, 250, 247, 0.8)",
          backdropFilter: "blur(14px) saturate(1.15)",
          WebkitBackdropFilter: "blur(14px) saturate(1.15)",
        }}
      >
        {/* key={step} forces a remount on every step change so the
            auth-step fade/slide-in (globals.css) replays each time —
            plain conditional rendering has nothing to animate from
            otherwise. */}
        <div key={step} className="auth-step flex flex-col gap-2">
          {step === "initial" && (
            <>
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
              <button
                type="button"
                onClick={() => goTo("email")}
                className="py-1 text-center text-[13px] font-semibold text-text-secondary"
              >
                Continue with email
              </button>
            </>
          )}

          {step === "email" && (
            <>
              <button
                type="button"
                onClick={() => goTo("initial")}
                className="flex items-center gap-0.5 self-start py-1 text-[12px] font-semibold text-text-muted"
              >
                <ChevronLeftIcon className="h-3 w-3" />
                Back
              </button>
              <p className="px-1 text-[15px] font-bold text-text-primary">Continue with email</p>
              <form onSubmit={handleEmailContinue} className="flex flex-col gap-2">
                <AuthField
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p className="text-[13px] text-error">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="mt-1 flex min-h-11 items-center justify-center rounded-full text-[14px] font-bold text-text-inverse disabled:opacity-60"
                  style={{ background: "var(--color-ink)" }}
                >
                  {loading ? "Checking..." : "Continue"}
                </button>
              </form>
            </>
          )}

          {step === "password-existing" && (
            <>
              <button
                type="button"
                onClick={() => goTo("email")}
                className="flex items-center gap-0.5 self-start py-1 text-[12px] font-semibold text-text-muted"
              >
                <ChevronLeftIcon className="h-3 w-3" />
                Back
              </button>
              <p className="px-1 text-[15px] font-bold text-text-primary">Welcome back.</p>
              <form onSubmit={handleLogin} className="flex flex-col gap-2">
                <AuthField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightSlot={passwordToggle}
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
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="self-center text-[12px] font-semibold text-pink-500"
                >
                  {forgotSent ? "Reset link sent." : "Forgot password?"}
                </button>
              </form>
            </>
          )}

          {step === "password-new" && (
            <>
              <button
                type="button"
                onClick={() => goTo("email")}
                className="flex items-center gap-0.5 self-start py-1 text-[12px] font-semibold text-text-muted"
              >
                <ChevronLeftIcon className="h-3 w-3" />
                Back
              </button>
              <p className="px-1 text-[15px] font-bold text-text-primary">Create your account.</p>
              <form onSubmit={handleCreateAccount} className="flex flex-col gap-1.5">
                <AuthField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightSlot={passwordToggle}
                />
                <p
                  className="px-1 text-[11px]"
                  style={{
                    color:
                      password.length > 0 && password.length < PASSWORD_MIN_LENGTH
                        ? "var(--color-error)"
                        : "var(--color-text-secondary)",
                  }}
                >
                  At least {PASSWORD_MIN_LENGTH} characters
                </p>
                {error && <p className="text-[13px] text-error">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || password.length < PASSWORD_MIN_LENGTH}
                  className="mt-1 flex min-h-11 items-center justify-center rounded-full text-[14px] font-bold text-text-inverse disabled:opacity-60"
                  style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
                >
                  {loading ? "Creating account..." : "Continue"}
                </button>
              </form>
            </>
          )}

          {step === "verify-sent" && (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <p className="text-[15px] font-bold text-text-primary">Check your inbox.</p>
              <p className="max-w-[240px] text-[13px] leading-relaxed text-text-secondary">
                We sent a verification link to {email}.
              </p>
              <div className="mt-1 flex gap-4">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[12px] font-semibold text-pink-500 disabled:opacity-60"
                >
                  {resending ? "Sending..." : resent ? "Sent!" : "Resend email"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("");
                    setPassword("");
                    setResent(false);
                    goTo("email");
                  }}
                  className="text-[12px] font-semibold text-text-muted"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
