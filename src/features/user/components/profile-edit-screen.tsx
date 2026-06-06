"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, Loader2, User as UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { Segmented } from "@/components/ui/segmented";
import {
  usePaymentAccountQuery,
  useChangePasswordMutation,
  useUpdatePaymentAccountMutation,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
  useUserQuery,
} from "@/features/user/api/use-user";
import type { UserGender } from "@/features/user/api/user.types";

const GENDER_OPTIONS = [
  { label: "남성", value: "male" as const },
  { label: "여성", value: "female" as const },
];

export function ProfileEditScreen() {
  const router = useRouter();
  const userQuery = useUserQuery();
  const accountQuery = usePaymentAccountQuery();

  const updateProfile = useUpdateProfileMutation();
  const updateAccount = useUpdatePaymentAccountMutation();
  const changePassword = useChangePasswordMutation();
  const uploadImage = useUploadProfileImageMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 기본 정보
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<UserGender | undefined>(undefined);
  // 정산 계좌
  const [bank, setBank] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  // 비밀번호
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const user = userQuery.data;

  // 사용자 정보 로드되면 폼 프리필
  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
    setGender(user.gender);
  }, [user]);

  useEffect(() => {
    const acc = accountQuery.data;
    if (!acc) return;
    setBank(acc.bank ?? "");
    setAccountHolder(acc.accountHolder ?? "");
    setAccountNumber(acc.accountNumber ?? "");
  }, [accountQuery.data]);

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 허용
    if (!file) return;
    setError(null);
    uploadImage.mutate(file, {
      onError: (err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "사진 업로드에 실패했어요.",
        ),
    });
  };

  const isSaving =
    updateProfile.isPending ||
    updateAccount.isPending ||
    changePassword.isPending;

  const handleSave = async () => {
    setError(null);

    // 비밀번호 입력 검증 (하나라도 입력 시 전체 검증)
    const passwordTouched =
      !!currentPassword || !!newPassword || !!confirmPassword;
    if (passwordTouched) {
      if (!currentPassword) return setError("현재 비밀번호를 입력해주세요.");
      if (newPassword.length < 8)
        return setError("새 비밀번호는 8자 이상이어야 해요.");
      if (newPassword !== confirmPassword)
        return setError("새 비밀번호가 일치하지 않아요.");
    }

    // 계좌 입력 검증 (일부만 입력 시 전체 요구)
    const accountFilled = [bank, accountHolder, accountNumber].filter(
      (v) => v.trim().length > 0,
    );
    const accountTouched = accountFilled.length > 0;
    if (accountTouched && accountFilled.length < 3)
      return setError("정산 계좌 정보를 모두 입력해주세요.");

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        gender,
      });

      if (accountTouched) {
        await updateAccount.mutateAsync({
          bank: bank.trim(),
          accountHolder: accountHolder.trim(),
          accountNumber: accountNumber.trim(),
        });
      }

      if (passwordTouched) {
        await changePassword.mutateAsync({ currentPassword, newPassword });
      }

      router.back();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "저장에 실패했어요.",
      );
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-bg-page">
      <header className="sticky top-0 z-10 flex h-14 w-full items-center border-b border-stroke-thin bg-bg-normal px-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="flex size-11 items-center justify-center"
        >
          <ChevronLeft className="size-6 text-fg-primary" />
        </button>
        <h1 className="text-strong-1 font-bold text-fg-primary">
          개인정보 수정
        </h1>
      </header>

      <div className="flex w-full flex-1 flex-col gap-7 px-5 pb-32 pt-2">
        {/* 프로필 사진 */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="relative size-[88px]">
            <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-point-100">
              {user?.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImageUrl}
                  alt={user.name ?? "프로필"}
                  className="size-full object-cover"
                />
              ) : (
                <UserIcon className="size-9 text-point-400" />
              )}
            </div>
            <button
              type="button"
              onClick={handlePickImage}
              disabled={uploadImage.isPending}
              aria-label="프로필 사진 변경"
              className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-point-500 text-fg-inverse shadow-sm transition-colors hover:bg-point-600 disabled:opacity-60"
            >
              {uploadImage.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={handlePickImage}
            disabled={uploadImage.isPending}
            className="text-caption-1 font-bold text-fg-secondary disabled:opacity-60"
          >
            프로필 사진 변경
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* 기본 정보 */}
        <Section title="기본 정보">
          <FieldCard>
            <Field label="학교 이메일 (변경 불가)">
              <input
                value={user?.email ?? ""}
                disabled
                className={fieldInputCls}
              />
            </Field>
            <Field label="이름">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
                className={fieldInputCls}
              />
            </Field>
            <Field label="전화번호">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="010-0000-0000"
                className={fieldInputCls}
              />
            </Field>
            <Field label="성별">
              <Segmented
                options={GENDER_OPTIONS}
                value={gender}
                onChange={setGender}
                className="mt-1"
              />
            </Field>
          </FieldCard>
        </Section>

        {/* 정산 계좌 */}
        <Section title="정산 계좌">
          <FieldCard>
            <Field label="은행">
              <input
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="예: KB국민은행"
                className={fieldInputCls}
              />
            </Field>
            <Field label="예금주">
              <input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="예금주명"
                className={fieldInputCls}
              />
            </Field>
            <Field label="계좌번호">
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                inputMode="numeric"
                placeholder="'-' 없이 입력"
                className={fieldInputCls}
              />
            </Field>
          </FieldCard>
        </Section>

        {/* 비밀번호 변경 */}
        <Section title="비밀번호 변경">
          <FieldCard>
            <Field label="현재 비밀번호">
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="현재 비밀번호 입력"
                className={fieldInputCls}
              />
            </Field>
            <Field label="새 비밀번호">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="8자 이상"
                className={fieldInputCls}
              />
            </Field>
            <Field label="새 비밀번호 확인">
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="비밀번호 재입력"
                className={fieldInputCls}
              />
            </Field>
          </FieldCard>
        </Section>

        {error && (
          <p className="text-center text-caption-1 font-bold text-fg-warning">
            {error}
          </p>
        )}
      </div>

      {/* 저장 (고정) */}
      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-screen-sm border-t border-stroke-thin bg-bg-page/95 px-5 py-4 backdrop-blur md:max-w-screen-md lg:max-w-screen-lg">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || userQuery.isLoading}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-point-500 text-base font-bold text-fg-inverse transition-colors hover:bg-point-600 disabled:bg-bg-disabled disabled:text-fg-disabled"
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {isSaving ? "저장 중…" : "변경사항 저장"}
        </button>
      </div>
    </div>
  );
}

const fieldInputCls = cn(
  "w-full bg-transparent text-body-1 font-bold text-fg-primary",
  "placeholder:font-normal placeholder:text-fg-tertiary",
  "focus:outline-none disabled:text-fg-tertiary",
);

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="px-1 text-caption-1 font-bold text-fg-secondary">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FieldCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-2xl bg-bg-normal px-4 shadow-sm [&>*+*]:border-t [&>*+*]:border-stroke-thin">
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 py-3.5">
      <span className="text-caption-2 font-bold text-fg-tertiary">
        {label}
      </span>
      {children}
    </div>
  );
}
