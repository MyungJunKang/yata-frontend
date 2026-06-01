"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignupFormField } from "@/features/auth/components/signup-form-field";
import { SignupProgress } from "@/features/auth/components/signup-progress";
import { useSignup } from "@/features/auth/components/signup-context";
import { validateStepTwo } from "@/features/auth/lib/signup-validation";

export function SignupStepTwoForm() {
  const router = useRouter();
  const { draft, setField } = useSignup();
  const [errors, setErrors] = useState<ReturnType<typeof validateStepTwo>>({});

  const isValid = Object.keys(validateStepTwo(draft)).length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStepTwo(draft);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    router.push("/signup/account");
  };

  const blur = (key: keyof typeof errors) => () => {
    const errs = validateStepTwo(draft);
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
          비밀번호를
          <br />
          설정해 주세요.
        </h2>
        <p className="text-body-2 leading-[1.6] text-fg-secondary">
          안전한 택시 공유 커뮤니티를 위해
          <br />
          보호 수준이 높은 비밀번호를 만들어주세요.
        </p>
      </div>

      <SignupProgress step={2} />

      <SignupFormField
        label="비밀번호"
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
        label="비밀번호 확인"
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
          <p className="text-strong-2 text-fg-primary">인증된 커뮤니티</p>
          <p className="text-caption-1 leading-[1.5] text-fg-secondary">
            인증된 숭실대학교 학생만 YATA 네트워크에 가입할 수 있어요. 모두에게
            안전하고 신뢰할 수 있는 이동을 보장합니다.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isValid}
        className="mt-2 h-14 w-full rounded-md bg-point-500 text-base font-bold text-fg-inverse hover:bg-point-600 disabled:bg-bg-disabled disabled:text-fg-disabled disabled:opacity-100"
      >
        다음 단계
        <ArrowRight />
      </Button>
    </form>
  );
}
