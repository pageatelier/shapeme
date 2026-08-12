"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { AuthField } from "@/components/auth/AuthField";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    // Supabase's signUp() deliberately doesn't error on an already-registered
    // email (avoids leaking which emails have accounts) — it returns a
    // "successful" response with no session and, distinctively, an empty
    // identities array. Without this check, a duplicate email silently fell
    // through to "Check your email" as if a real confirmation had just been
    // sent, even though nothing was.
    if (data.user && data.user.identities?.length === 0) {
      setError("An account with this email already exists. Try logging in instead.");
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  }

  // Same treatment as the login page (same background photo, same
  // bottom-anchored logo+tagline+card group) — see LoginForm.tsx for the
  // reasoning behind each piece (fixed-not-absolute background sizing,
  // the negative-z-index stacking-context note, the card's 87% alpha).
  return (
    <div className="relative mt-auto flex flex-col gap-4">
      {/* top-0 + .onboarding-fixed-bg — see LoginForm.tsx's identical
          wrapper for why (iOS Safari's dynamic toolbar can otherwise leave
          a gap of the page's own background showing above/below the
          photo, even with a plain height:100dvh). */}
      <div
        className="onboarding-fixed-bg pointer-events-none fixed top-0 left-1/2 z-[-1] w-full max-w-[var(--container-sm)] -translate-x-1/2"
      >
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
        <BrandLogo className="mb-2" light />
        <p className="text-[13px] leading-relaxed text-white/80">
          Shape your body.
          <br />
          On your terms.
        </p>
      </div>

      {checkEmail ? (
        <div
          className="glass-card flex flex-col items-center gap-3 p-6 text-center"
          style={{
            background: "rgba(251, 250, 247, 0.8)",
            backdropFilter: "blur(14px) saturate(1.15)",
            WebkitBackdropFilter: "blur(14px) saturate(1.15)",
          }}
        >
          <p className="text-[15px] font-bold text-text-primary">Check your email</p>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            We sent a confirmation link to {email}. Follow it to finish creating your account.
          </p>
          <Link href="/login" className="mt-2 text-[13px] font-semibold text-pink-500">
            Back to log in
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="glass-card flex flex-col gap-2 p-4"
          style={{
            background: "rgba(251, 250, 247, 0.8)",
            backdropFilter: "blur(14px) saturate(1.15)",
            WebkitBackdropFilter: "blur(14px) saturate(1.15)",
          }}
        >
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
            className="mt-2 flex min-h-[52px] items-center justify-center rounded-full text-[15px] font-bold text-text-inverse disabled:opacity-60"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-pink)" }}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="mt-3 text-center text-[13px] text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-pink-500">
              Log in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
