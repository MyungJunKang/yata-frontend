"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@/features/auth/api/use-sign-in";
import { EmailSsuInput } from "@/features/auth/components/email-ssu-input";
import { ApiError } from "@/lib/api-client";

function validateEmail(value: string): string {
  if (!value) return "이메일을 입력해 주세요.";
  if (!/^[^\s@]+@ssu\.ac\.kr$/.test(value))
    return "@ssu.ac.kr 이메일만 사용할 수 있어요.";
  return "";
}

function validatePassword(value: string): string {
  if (!value) return "비밀번호를 입력해 주세요.";
  return "";
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const signInMutation = useSignIn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;
    signInMutation.mutate({ email, password });
  };

  const submitError =
    signInMutation.error instanceof ApiError
      ? signInMutation.error.status === 401
        ? "이메일 또는 비밀번호가 일치하지 않아요."
        : signInMutation.error.message
      : signInMutation.error
        ? "로그인 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요."
        : null;

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center bg-bg-page px-6 pb-6 pt-8">
      <header className="flex w-full flex-col items-center pt-2">
        <Image
          src="/images/yata-mascot.png"
          alt="YATA 마스코트"
          width={127}
          height={125}
          priority
        />
        <h1 className="font-display text-[44px] font-extrabold italic leading-none tracking-[-0.05em] text-fg-primary">
          YATA
        </h1>
        <p className="mt-1 text-[15px] font-medium leading-[1.5] text-fg-secondary text-center">
          숭실대학교 학생들을 위한
          <br />
          택시 공유 서비스
        </p>
      </header>

      <div className="h-[18px] w-full shrink-0" />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full flex-col gap-5 rounded-[32px] bg-bg-normal px-6 py-7 shadow-sm"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[14px] font-medium text-fg-secondary"
          >
            숭실대학교 이메일
          </label>
          <EmailSsuInput
            id="email"
            placeholder="student_id"
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (emailError) setEmailError(validateEmail(v));
            }}
            onBlur={() => setEmailError(validateEmail(email))}
            autoComplete="email"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && (
            <p
              id="email-error"
              className="text-[12px] font-medium text-fg-warning"
            >
              {emailError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[14px] font-medium text-fg-secondary"
            >
              비밀번호
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-bold text-fg-point transition-colors hover:text-point-600"
            >
              비밀번호 찾기
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError)
                setPasswordError(validatePassword(e.target.value));
            }}
            onBlur={() => setPasswordError(validatePassword(password))}
            autoComplete="current-password"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          {passwordError && (
            <p
              id="password-error"
              className="text-[12px] font-medium text-fg-warning"
            >
              {passwordError}
            </p>
          )}
        </div>

        {submitError && (
          <p
            role="alert"
            className="rounded-sm bg-red-100 px-3 py-2 text-[12px] font-medium text-fg-warning"
          >
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          disabled={signInMutation.isPending}
          className="h-14 w-full rounded-sm bg-point-500 text-base font-bold text-fg-inverse hover:bg-point-600 disabled:bg-bg-disabled disabled:text-fg-disabled disabled:opacity-100"
        >
          {signInMutation.isPending ? "로그인 중…" : "로그인"}
          {!signInMutation.isPending && <ArrowRight />}
        </Button>

        <Link
          href="/signup"
          className="inline-flex h-14 w-full items-center justify-center rounded-sm border border-stroke-normal bg-bg-normal text-base font-bold text-fg-primary transition-colors hover:bg-bg-elevated"
        >
          회원가입
        </Link>
      </form>

      <div className="h-[22px] w-full shrink-0" />

      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center">
          <span className="-mr-3 size-9 rounded-full border-2 border-white bg-gray-100 shadow-sm" />
          <span className="-mr-3 size-9 rounded-full border-2 border-white bg-gray-200 shadow-sm" />
          <span className="size-9 rounded-full border-2 border-white bg-gray-300 shadow-sm" />
        </div>
        <p className="text-eyebrow text-fg-tertiary">
          숭실대 학생 3,400명+ 이용 중
        </p>
      </div>

      <div className="h-[28px] w-full shrink-0" />

      <p className="text-center text-[12px] font-medium leading-[1.7] text-fg-tertiary">
        YATA는 숭실대학교 구성원만을 위한 서비스입니다.
        <br />
        계정 사용 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
      </p>
    </div>
  );
}
