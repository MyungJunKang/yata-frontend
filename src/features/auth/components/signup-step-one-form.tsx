"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Segmented } from "@/components/ui/segmented";
import { DepartmentCombobox } from "@/features/auth/components/department-combobox";
import { EmailSsuInput } from "@/features/auth/components/email-ssu-input";
import { SignupFormField } from "@/features/auth/components/signup-form-field";
import { SignupProgress } from "@/features/auth/components/signup-progress";
import { useSignup } from "@/features/auth/components/signup-context";
import { formatPhone } from "@/features/auth/lib/format";
import { validateStepOne } from "@/features/auth/lib/signup-validation";

const GENDER_OPTIONS = [
  { label: "남성", value: "male" },
  { label: "여성", value: "female" },
] as const;

// 학번(입학 연도 끝 2자리) 선택 옵션 — 올해부터 과거 20년. 미래 연도는 선택 불가.
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 21 }, (_, i) => {
  const yy = String((CURRENT_YEAR - i) % 100).padStart(2, "0");
  return { label: `${yy}학번`, value: yy };
});

export function SignupStepOneForm() {
  const router = useRouter();
  const { draft, setField } = useSignup();
  const [errors, setErrors] = useState<ReturnType<typeof validateStepOne>>({});

  const isValid = Object.keys(validateStepOne(draft)).length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStepOne(draft);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    router.push("/signup/password");
  };

  const blur = (key: keyof typeof errors) => () => {
    const errs = validateStepOne(draft);
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
          지금 바로 야타에
          <br />
          합류하세요.
        </h2>
        <p className="text-body-2 text-fg-secondary">
          숭실대학교 택시 공유 서비스
        </p>
      </div>

      <SignupProgress step={1} />

      <SignupFormField
        label="이름"
        htmlFor="name"
        error={errors.name}
        helper="실명으로 입력해 주세요. 학생증과 일치해야 해요."
        required
      >
        <Input
          id="name"
          value={draft.name ?? ""}
          onChange={(e) => setField("name", e.target.value)}
          onBlur={blur("name")}
          placeholder="예: 김 숭실"
          autoComplete="name"
          aria-invalid={!!errors.name}
        />
      </SignupFormField>

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

      <SignupFormField
        label="전화번호"
        htmlFor="phone"
        error={errors.phone}
        helper="숫자만 입력하면 하이픈이 자동으로 추가돼요."
        required
      >
        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          value={draft.phone ?? ""}
          onChange={(e) => setField("phone", formatPhone(e.target.value))}
          onBlur={blur("phone")}
          placeholder="010-0000-0000"
          autoComplete="tel"
          maxLength={13}
          aria-invalid={!!errors.phone}
        />
      </SignupFormField>

      <SignupFormField
        label="성별"
        htmlFor="gender"
        error={errors.gender}
        helper="안전한 매칭을 위해 사용돼요."
        required
      >
        <Segmented
          options={GENDER_OPTIONS}
          value={draft.gender}
          onChange={(v) => setField("gender", v)}
          invalid={!!errors.gender}
        />
      </SignupFormField>

      <div className="flex gap-3">
        <SignupFormField
          label="학과"
          htmlFor="department"
          error={errors.department}
          helper="검색해서 선택해 주세요."
          required
          className="flex-[2]"
        >
          <DepartmentCombobox
            id="department"
            value={draft.department ?? ""}
            onChange={(v) => setField("department", v)}
            onBlur={blur("department")}
            placeholder="학과 선택"
            invalid={!!errors.department}
          />
        </SignupFormField>
        <SignupFormField
          label="학번"
          htmlFor="studentId"
          error={errors.studentId}
          helper="입학 연도"
          required
          className="flex-1"
        >
          <Combobox
            id="studentId"
            value={draft.studentId ?? ""}
            onChange={(v) => setField("studentId", v)}
            onBlur={blur("studentId")}
            options={YEAR_OPTIONS}
            placeholder="선택"
            invalid={!!errors.studentId}
          />
        </SignupFormField>
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
