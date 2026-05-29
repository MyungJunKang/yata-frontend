"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthAppBar } from "@/features/auth/components/auth-app-bar";
import { EmailSsuInput } from "@/features/auth/components/email-ssu-input";
import { SignupFormField } from "@/features/auth/components/signup-form-field";
import {
  validateForgotPassword,
  type ForgotPasswordDraft,
} from "@/features/auth/lib/forgot-password-validation";

type View = "form" | "success";

export function ForgotPasswordView() {
  const [view, setView] = useState<View>("form");
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<ForgotPasswordDraft>({});
  const [errors, setErrors] = useState<
    ReturnType<typeof validateForgotPassword>
  >({});

  const isValid = Object.keys(validateForgotPassword(draft)).length === 0;

  const setField = <K extends keyof ForgotPasswordDraft>(
    key: K,
    value: ForgotPasswordDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const blur = (key: keyof typeof errors) => () => {
    const errs = validateForgotPassword(draft);
    setErrors((prev) => ({ ...prev, [key]: errs[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForgotPassword(draft);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    // TODO: 비밀번호 변경 API 호출 (TanStack Query mutation)
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setView("success");
  };

  if (view === "success") {
    return (
      <>
        <AuthAppBar backHref="/login" title="비밀번호 찾기" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2 py-12">
            <span className="flex size-20 items-center justify-center rounded-full bg-point-100">
              <CircleCheck className="size-10 text-fg-point" />
            </span>
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-[28px] font-extrabold leading-[1.25] tracking-[-0.02em] text-fg-primary">
                비밀번호가
                <br />
                변경되었어요.
              </h2>
              <p className="text-body-2 leading-[1.6] text-fg-secondary">
                새 비밀번호로 다시 로그인해 주세요.
              </p>
            </div>
          </div>
          <Button
            asChild
            className="h-14 w-full rounded-md bg-point-500 text-base font-bold text-fg-inverse hover:bg-point-600"
          >
            <Link href="/login">
              로그인하러 가기
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthAppBar backHref="/login" title="비밀번호 찾기" />
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full flex-col gap-5"
      >
        <div className="flex flex-col gap-2 pt-2">
          <h2 className="text-[28px] font-extrabold leading-[1.25] tracking-[-0.02em] text-fg-primary">
            비밀번호를
            <br />
            재설정해 주세요.
          </h2>
          <p className="text-body-2 leading-[1.6] text-fg-secondary">
            가입 시 사용한 학교 이메일과
            <br />
            새 비밀번호를 입력해 주세요.
          </p>
        </div>

        <SignupFormField
          label="학교 이메일"
          htmlFor="email"
          error={errors.email}
          helper="@ssu.ac.kr 학교 이메일만 사용할 수 있어요."
          required
        >
          <EmailSsuInput
            id="email"
            value={draft.email ?? ""}
            onChange={(v) => setField("email", v)}
            onBlur={blur("email")}
            placeholder="student_id"
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
        </SignupFormField>

        <SignupFormField
          label="새 비밀번호"
          htmlFor="password"
          error={errors.password}
          helper="8자 이상, 영문 + 숫자 조합을 권장해요."
          required
        >
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={draft.password ?? ""}
              onChange={(e) => setField("password", e.target.value)}
              onBlur={blur("password")}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="pr-11"
            />
            <Lock
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-fg-tertiary"
            />
          </div>
        </SignupFormField>

        <SignupFormField
          label="새 비밀번호 확인"
          htmlFor="passwordConfirm"
          error={errors.passwordConfirm}
          helper="위에 입력한 비밀번호를 한 번 더 입력해 주세요."
          required
        >
          <div className="relative">
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="••••••••"
              value={draft.passwordConfirm ?? ""}
              onChange={(e) => setField("passwordConfirm", e.target.value)}
              onBlur={blur("passwordConfirm")}
              autoComplete="new-password"
              aria-invalid={!!errors.passwordConfirm}
              className="pr-11"
            />
            <Lock
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-fg-tertiary"
            />
          </div>
        </SignupFormField>

        <div className="flex items-start gap-3 rounded-md bg-bg-subtle p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-point-100">
            <ShieldCheck className="size-5 text-fg-point" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-strong-2 text-fg-primary">안전한 재설정</p>
            <p className="text-caption-1 leading-[1.5] text-fg-secondary">
              변경 후에는 새 비밀번호로 로그인해 주세요. 비밀번호는 본인만
              알 수 있도록 안전하게 보관해 주세요.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isValid || submitting}
          className="mt-2 h-14 w-full rounded-md bg-point-500 text-base font-bold text-fg-inverse hover:bg-point-600 disabled:bg-bg-disabled disabled:text-fg-disabled disabled:opacity-100"
        >
          {submitting ? "변경 중…" : "비밀번호 변경"}
          {!submitting && <ArrowRight />}
        </Button>
      </form>
    </>
  );
}
