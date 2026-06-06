"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CircleCheck, Lock, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/features/auth/api/use-password-reset";
import { AuthAppBar } from "@/features/auth/components/auth-app-bar";
import { SignupFormField } from "@/features/auth/components/signup-form-field";
import {
  validateResetPassword,
  type ResetPasswordDraft,
} from "@/features/auth/lib/forgot-password-validation";
import { ApiError } from "@/lib/api-client";

export function ResetPasswordView() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [draft, setDraft] = useState<ResetPasswordDraft>({});
  const [errors, setErrors] = useState<
    ReturnType<typeof validateResetPassword>
  >({});
  const resetMutation = useResetPasswordMutation();

  const isValid = Object.keys(validateResetPassword(draft)).length === 0;

  const setField = <K extends keyof ResetPasswordDraft>(
    key: K,
    value: ResetPasswordDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const blur = (key: keyof typeof errors) => () => {
    const errs = validateResetPassword(draft);
    setErrors((prev) => ({ ...prev, [key]: errs[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateResetPassword(draft);
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !draft.password) return;
    resetMutation.mutate({ token, newPassword: draft.password });
  };

  const submitError =
    resetMutation.error instanceof ApiError
      ? resetMutation.error.status === 400
        ? "재설정 링크가 만료되었거나 올바르지 않아요. 메일을 다시 요청해 주세요."
        : resetMutation.error.message
      : resetMutation.error
        ? "비밀번호 재설정 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요."
        : null;

  // 토큰이 없으면 잘못된 링크 — 폼 대신 안내만 노출
  if (!token) {
    return (
      <>
        <AuthAppBar backHref="/login" title="비밀번호 재설정" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2 py-12">
            <span className="flex size-20 items-center justify-center rounded-full bg-red-100">
              <TriangleAlert className="size-10 text-fg-warning" />
            </span>
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-[28px] font-extrabold leading-[1.25] tracking-[-0.02em] text-fg-primary">
                유효하지 않은
                <br />
                링크예요.
              </h2>
              <p className="text-body-2 leading-[1.6] text-fg-secondary">
                재설정 링크가 올바르지 않아요.
                <br />
                비밀번호 찾기에서 메일을 다시 요청해 주세요.
              </p>
            </div>
          </div>
          <Button
            asChild
            className="h-14 w-full rounded-md bg-point-500 text-base font-bold text-fg-inverse hover:bg-point-600"
          >
            <Link href="/forgot-password">
              비밀번호 찾기로 가기
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </>
    );
  }

  if (resetMutation.isSuccess) {
    return (
      <>
        <AuthAppBar backHref="/login" title="비밀번호 재설정" />
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
      <AuthAppBar backHref="/login" title="비밀번호 재설정" />
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full flex-col gap-5"
      >
        <div className="flex flex-col gap-2 pt-2">
          <h2 className="text-[28px] font-extrabold leading-[1.25] tracking-[-0.02em] text-fg-primary">
            새 비밀번호를
            <br />
            설정해 주세요.
          </h2>
          <p className="text-body-2 leading-[1.6] text-fg-secondary">
            앞으로 로그인할 때 사용할
            <br />
            새 비밀번호를 입력해 주세요.
          </p>
        </div>

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
          disabled={!isValid || resetMutation.isPending}
          className="mt-2 h-14 w-full rounded-md bg-point-500 text-base font-bold text-fg-inverse hover:bg-point-600 disabled:bg-bg-disabled disabled:text-fg-disabled disabled:opacity-100"
        >
          {resetMutation.isPending ? "변경 중…" : "비밀번호 변경"}
          {!resetMutation.isPending && <ArrowRight />}
        </Button>
      </form>
    </>
  );
}
