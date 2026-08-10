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
    // mt-auto pulls this block toward the bottom of the parent's centered
    // flex column (an auto margin claims all free space on that side,
    // overriding the parent's justify-center) — keeps the photo's upper
    // portion uncovered instead of the form sitting mid-image.
    <div className="relative mt-auto flex flex-col gap-6">
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

      <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-4 p-6">
        <AuthField
          label="이메일"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          label="비밀번호"
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
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="text-center text-[13px] text-white/80">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-semibold text-white">
          회원가입
        </Link>
      </p>
    </div>
  );
}
