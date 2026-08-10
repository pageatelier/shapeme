"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { AuthField } from "@/components/auth/AuthField";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    // mt-auto pulls this whole block — logo, tagline, and the card — down
    // as one bottom-anchored group (an auto margin claims all free space
    // above it, overriding the parent's justify-center), so the photo's
    // full upper portion stays uncovered instead of splitting the gap
    // between "above the block" and "above just the card".
    <div className="relative mt-auto flex flex-col gap-4">
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
        <BrandLogo className="mb-2" light />
        <p className="text-[13px] leading-relaxed text-white/80">
          Shape your body.
          <br />
          On your terms.
        </p>
      </div>

      {/* No extra margin here anymore — the outer gap-4 (plus mt-auto on
          the whole group above) does all the positioning now that logo,
          tagline, and card move together as one bottom-anchored unit.
          Padding/gap trimmed from p-6/gap-4 to p-4/gap-2 keeps the card
          itself compact. Opaque card background swaps .glass-card's
          fully-solid var(--glass-background) for the same color at 87%
          alpha — low enough to let the photo show through, not so low the
          text over it gets noisy. */}
      <form
        onSubmit={handleSubmit}
        className="glass-card flex flex-col gap-2 p-4"
        style={{ background: "rgba(251, 250, 247, 0.87)" }}
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
          autoComplete="current-password"
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
          {loading ? "Signing in..." : "Log in"}
        </button>

        {/* Inside the card (not floating below it) so a short viewport
            can't clip it off-screen underneath the now-lower-anchored box.
            mt-3 on top of the form's own gap-2 — flush against the button
            read as if it belonged to it rather than being a separate link. */}
        <p className="mt-3 text-center text-[13px] text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-pink-500">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
