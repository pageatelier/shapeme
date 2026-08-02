"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
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
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="font-en mb-2 text-2xl font-medium tracking-[-0.055em] text-text-primary lowercase">
          shapeme
        </p>
        <p className="text-[13px] text-text-secondary">로그인하고 오늘의 나를 기록해보세요.</p>
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

      <p className="text-center text-[13px] text-text-secondary">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-semibold text-pink-500">
          회원가입
        </Link>
      </p>
    </div>
  );
}
