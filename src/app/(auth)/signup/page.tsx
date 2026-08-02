"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
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

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-[15px] font-bold text-text-primary">이메일을 확인해주세요</p>
        <p className="text-[13px] leading-relaxed text-text-secondary">
          {email}로 인증 링크를 보냈어요. 링크를 눌러 가입을 완료해주세요.
        </p>
        <Link href="/login" className="mt-2 text-[13px] font-semibold text-pink-500">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="font-en mb-2 text-2xl font-medium tracking-[-0.055em] text-text-primary lowercase">
          shapeme
        </p>
        <p className="text-[13px] text-text-secondary">
          운동, 식단, 물, 눈바디를 한곳에서 기록해보세요.
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
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <p className="text-center text-[13px] text-text-secondary">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-semibold text-pink-500">
          로그인
        </Link>
      </p>
    </div>
  );
}
