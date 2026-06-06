"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRequestPasswordResetMutation } from "@/features/auth/api/use-password-reset";
import { AuthAppBar } from "@/features/auth/components/auth-app-bar";
import { EmailSsuInput } from "@/features/auth/components/email-ssu-input";
import { SignupFormField } from "@/features/auth/components/signup-form-field";
import {
  validateForgotPassword,
  type ForgotPasswordDraft,
} from "@/features/auth/lib/forgot-password-validation";
import { ApiError } from "@/lib/api-client";

export function ForgotPasswordView() {
  const [draft, setDraft] = useState<ForgotPasswordDraft>({});
  const [errors, setErrors] = useState<
    ReturnType<typeof validateForgotPassword>
  >({});
  const forgotMutation = useRequestPasswordResetMutation();

  const isValid = Object.keys(validateForgotPassword(draft)).length === 0;

  const setField = <K extends keyof ForgotPasswordDraft>(
    key: K,
    value: ForgotPasswordDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const blur = (key: keyof typeof errors) => () => {
    const errs = validateForgotPassword(draft);
    setErrors((prev) => ({ ...prev, [key]: errs[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForgotPassword(draft);
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !draft.email) return;
    forgotMutation.mutate({ email: draft.email });
  };

  const submitError =
    forgotMutation.error instanceof ApiError
      ? forgotMutation.error.message
      : forgotMutation.error
        ? "메일 발송 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요."
        : null;

  if (forgotMutation.isSuccess) {
    return (
      <>
        <AuthAppBar backHref="/login" title="비밀번호 찾기" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2 py-12">
            <span className="flex size-20 items-center justify-center rounded-full bg-point-100">
              <Mail className="size-10 text-fg-point" />
            </span>
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-[28px] font-extrabold leading-[1.25] tracking-[-0.02em] text-fg-primary">
                비밀번호 재설정
                <br />
                메일을 보냈어요.
              </h2>
              <p className="text-body-2 leading-[1.6] text-fg-secondary">
                <span className="font-bold text-fg-primary">
                  {draft.email}
                </span>
                <br />
                메일함에서 링크를 눌러
                <br />
                새 비밀번호를 설정해 주세요.
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
            잊으셨나요?
          </h2>
          <p className="text-body-2 leading-[1.6] text-fg-secondary">
            가입 시 사용한 학교 이메일을 입력하면
            <br />
            비밀번호 재설정 링크를 메일로 보내드려요.
          </p>
        </div>

        <SignupFormField
          label="학교 이메일"
          htmlFor="email"
          error={errors.email}
          helper="@soongsil.ac.kr 학교 이메일만 사용할 수 있어요."
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

        <div className="flex items-start gap-3 rounded-md bg-bg-subtle p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-point-100">
            <ShieldCheck className="size-5 text-fg-point" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-strong-2 text-fg-primary">안전한 재설정</p>
            <p className="text-caption-1 leading-[1.5] text-fg-secondary">
              본인 확인을 위해 메일로 재설정 링크를 보내드려요. 메일이 보이지
              않으면 스팸함도 확인해 주세요.
            </p>
          </div>
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
          disabled={!isValid || forgotMutation.isPending}
          className="mt-2 h-14 w-full rounded-md bg-point-500 text-base font-bold text-fg-inverse hover:bg-point-600 disabled:bg-bg-disabled disabled:text-fg-disabled disabled:opacity-100"
        >
          {forgotMutation.isPending ? "메일 보내는 중…" : "재설정 메일 받기"}
          {!forgotMutation.isPending && <ArrowRight />}
        </Button>
      </form>
    </>
  );
}
