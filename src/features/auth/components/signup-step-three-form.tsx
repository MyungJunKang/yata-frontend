"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { useSignUp } from "@/features/auth/api/use-sign-up";
import { useUpdatePaymentAccountMutation } from "@/features/user/api/use-user";
import { SignupFormField } from "@/features/auth/components/signup-form-field";
import { SignupProgress } from "@/features/auth/components/signup-progress";
import { useSignup } from "@/features/auth/components/signup-context";
import { validateStepThree } from "@/features/auth/lib/signup-validation";
import { ApiError } from "@/lib/api-client";
import type { SignUpBody } from "@/features/auth/api/auth.types";

const BANKS = [
  "KB국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "NH농협은행",
  "카카오뱅크",
  "토스뱅크",
  "SC제일은행",
  "IBK기업은행",
  "케이뱅크",
  "Sh수협은행",
  "씨티은행",
] as const;

const BANK_OPTIONS = BANKS.map((b) => ({ label: b, value: b }));

export function SignupStepThreeForm() {
  const router = useRouter();
  const { draft, setField, reset } = useSignup();
  const [errors, setErrors] = useState<ReturnType<typeof validateStepThree>>(
    {},
  );
  const [isCompleting, setIsCompleting] = useState(false);
  const signUpMutation = useSignUp();
  const updatePaymentAccountMutation = useUpdatePaymentAccountMutation();

  const isPending = isCompleting || signUpMutation.isPending;

  const isValid = Object.keys(validateStepThree(draft)).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStepThree(draft);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // 이전 단계 입력이 유실됐으면(직접 진입/세션 초기화 등) 1단계부터 다시
    if (
      !draft.name ||
      !draft.email ||
      !draft.phone ||
      !draft.gender ||
      !draft.department ||
      !draft.studentId ||
      !draft.password
    ) {
      router.replace("/signup");
      return;
    }

    const body: SignUpBody = {
      name: draft.name,
      email: draft.email,
      phone: draft.phone,
      gender: draft.gender,
      dept: draft.department,
      year: draft.studentId,
      password: draft.password,
    };

    setIsCompleting(true);
    try {
      await signUpMutation.mutateAsync(body);
    } catch {
      // 회원가입 실패 시 draft 를 유지해 입력값 그대로 다시 시도할 수 있게 한다
      // (여기서 reset 하면 재시도 시 빈 payload 가 전송됨)
      setIsCompleting(false);
      return;
    }

    // 회원가입 성공 후 httpOnly 쿠키로 인증되므로 계좌 등록을 이어서 진행.
    // 계좌 등록은 fire-and-forget 이 아니라 결과를 기다린다 — 실패하면 draft 를 유지하고
    // 사용자가 동일 입력으로 다시 시도하거나 마이페이지에서 추가 등록할 수 있게 한다.
    try {
      await updatePaymentAccountMutation.mutateAsync({
        bank: draft.bank!,
        accountNumber: draft.accountNumber!,
        accountHolder: draft.accountHolder!,
      });
    } catch (err) {
      // 가입은 이미 끝났지만 계좌 등록만 실패한 상태 — draft 는 그대로 두고
      // 사용자가 본 페이지에서 재시도하거나 마이페이지에서 등록할 수 있게 한다.
      console.error("payment account registration failed after signup", err);
      setIsCompleting(false);
      return;
    }

    reset();
    router.replace("/home");
    router.refresh();
  };

  const submitError =
    signUpMutation.error instanceof ApiError
      ? signUpMutation.error.message
      : signUpMutation.error
        ? "회원가입 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요."
        : updatePaymentAccountMutation.error instanceof ApiError
          ? `계좌 등록에 실패했어요: ${updatePaymentAccountMutation.error.message} · 다시 시도하거나 가입 후 마이페이지에서 등록할 수 있어요.`
          : updatePaymentAccountMutation.error
            ? "계좌 등록에 실패했어요. 다시 시도하거나 가입 후 마이페이지에서 등록해 주세요."
            : null;

  const blur = (key: keyof typeof errors) => () => {
    const errs = validateStepThree(draft);
    setErrors((prev) => ({ ...prev, [key]: errs[key] }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <div className="flex flex-col gap-2 pt-2">
        <h2 className="text-[28px] font-extrabold leading-[1.25] tracking-[-0.02em] text-fg-primary">
          정산받을 계좌를
          <br />
          등록해 주세요.
        </h2>
        <p className="text-body-2 leading-[1.6] text-fg-secondary">
          택시비 정산 시 자동으로 사용돼요.
          <br />
          마이페이지에서 언제든 변경할 수 있어요.
        </p>
      </div>

      <SignupProgress step={3} />

      <SignupFormField
        label="은행"
        htmlFor="bank"
        error={errors.bank}
        helper="정산받을 은행을 선택해 주세요."
        required
      >
        <Combobox
          id="bank"
          value={draft.bank ?? ""}
          onChange={(v) => setField("bank", v)}
          onBlur={blur("bank")}
          options={BANK_OPTIONS}
          placeholder="은행 선택"
          invalid={!!errors.bank}
          searchable
          searchPlaceholder="은행 검색"
        />
      </SignupFormField>

      <SignupFormField
        label="예금주"
        htmlFor="accountHolder"
        error={errors.accountHolder}
        helper="본인 명의의 계좌만 등록할 수 있어요."
        required
      >
        <div className="relative">
          <Input
            id="accountHolder"
            type="text"
            placeholder="본인 이름"
            value={draft.accountHolder ?? ""}
            onChange={(e) => setField("accountHolder", e.target.value)}
            onBlur={blur("accountHolder")}
            aria-invalid={!!errors.accountHolder}
            className="pr-11"
          />
          <Lock
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-fg-tertiary"
          />
        </div>
      </SignupFormField>

      <SignupFormField
        label="계좌번호"
        htmlFor="accountNumber"
        error={errors.accountNumber}
        helper="하이픈(-) 없이 숫자만 입력해 주세요."
        required
      >
        <Input
          id="accountNumber"
          type="text"
          inputMode="numeric"
          placeholder="예: 1101234567890"
          value={draft.accountNumber ?? ""}
          onChange={(e) =>
            setField("accountNumber", e.target.value.replace(/\D/g, ""))
          }
          onBlur={blur("accountNumber")}
          aria-invalid={!!errors.accountNumber}
          maxLength={16}
        />
      </SignupFormField>

      <div className="flex items-start gap-3 rounded-md bg-bg-subtle p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-point-100">
          <Wallet className="size-5 text-fg-point" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-strong-2 text-fg-primary">빠르고 안전한 정산</p>
          <p className="text-caption-1 leading-[1.5] text-fg-secondary">
            정산 시 자동으로 송금받을 계좌로 사용돼요. 매번 입력할 필요 없이
            빠르게 정산이 진행됩니다.
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
        disabled={!isValid || isPending}
        className="mt-2 h-14 w-full rounded-md bg-point-500 text-base font-bold text-fg-inverse hover:bg-point-600 disabled:bg-bg-disabled disabled:text-fg-disabled disabled:opacity-100"
      >
        {isPending ? "가입 중…" : "회원가입 완료"}
        {!isPending && <ArrowRight />}
      </Button>
    </form>
  );
}
