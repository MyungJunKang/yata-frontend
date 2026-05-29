"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SignupFormField } from "@/features/auth/components/signup-form-field";
import { SignupProgress } from "@/features/auth/components/signup-progress";
import { useSignup } from "@/features/auth/components/signup-context";
import { setAuthToken } from "@/features/auth/lib/auth-storage";
import { validateStepThree } from "@/features/auth/lib/signup-validation";

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

export function SignupStepThreeForm() {
  const router = useRouter();
  const { draft, setField, reset } = useSignup();
  const [errors, setErrors] = useState<ReturnType<typeof validateStepThree>>(
    {},
  );

  const isValid = Object.keys(validateStepThree(draft)).length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStepThree(draft);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // TODO: 회원가입 API 호출 (TanStack Query mutation)
    setAuthToken("signup-stub-token");
    reset();
    router.replace("/home");
  };

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
        <Select
          id="bank"
          value={draft.bank ?? ""}
          onChange={(e) => setField("bank", e.target.value)}
          onBlur={blur("bank")}
          aria-invalid={!!errors.bank}
        >
          <option value="" disabled>
            은행 선택
          </option>
          {BANKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
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

      <Button
        type="submit"
        disabled={!isValid}
        className="mt-2 h-14 w-full rounded-md bg-point-500 text-base font-bold text-fg-inverse hover:bg-point-600 disabled:bg-bg-disabled disabled:text-fg-disabled disabled:opacity-100"
      >
        회원가입 완료
        <ArrowRight />
      </Button>
    </form>
  );
}
