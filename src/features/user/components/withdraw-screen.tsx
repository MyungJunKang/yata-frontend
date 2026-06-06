"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ChevronLeft, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useDeleteAccountMutation } from "@/features/user/api/use-user";
import type { WithdrawReason } from "@/features/user/api/user.types";

const REASON_OPTIONS: { value: WithdrawReason; label: string }[] = [
  { value: "no_longer_needed", label: "더 이상 필요하지 않아요" },
  { value: "privacy", label: "개인정보가 걱정돼요" },
  { value: "found_alternative", label: "다른 서비스를 찾았어요" },
  { value: "other", label: "기타" },
];

const WITHDRAW_NOTICES = [
  "프로필, 정산 계좌, 탑승 내역 등 모든 개인정보가 즉시 삭제돼요.",
  "삭제된 데이터는 복구할 수 없어요.",
  "진행 중인 정산이나 방이 있다면 먼저 마무리해주세요.",
];

export function WithdrawScreen() {
  const router = useRouter();
  const deleteAccount = useDeleteAccountMutation();

  const [reason, setReason] = useState<WithdrawReason | null>(null);
  const [feedback, setFeedback] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = reason !== null && password.trim().length > 0;

  const handleSubmit = async () => {
    setError(null);
    if (!reason) return setError("탈퇴 사유를 선택해주세요.");
    if (!password.trim()) return setError("비밀번호를 입력해주세요.");

    try {
      await deleteAccount.mutateAsync({
        password,
        reason,
        feedback: feedback.trim() || undefined,
      });
      router.replace("/login");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "탈퇴 처리에 실패했어요. 잠시 후 다시 시도해주세요.",
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
        <h1 className="text-strong-1 font-bold text-fg-primary">회원 탈퇴</h1>
      </header>

      <div className="flex w-full flex-1 flex-col gap-7 px-5 pb-32 pt-2">
        {/* 데이터 삭제 안내 */}
        <div className="flex flex-col gap-3 rounded-2xl bg-red-100 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-fg-warning" />
            <span className="text-body-1 font-bold text-fg-warning">
              탈퇴하기 전에 꼭 확인해주세요
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {WITHDRAW_NOTICES.map((notice) => (
              <li
                key={notice}
                className="flex items-start gap-2 text-caption-1 font-medium text-fg-secondary"
              >
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-fg-warning" />
                <span>{notice}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 탈퇴 사유 */}
        <Section title="탈퇴 사유">
          <div className="flex flex-col gap-2">
            {REASON_OPTIONS.map((opt) => {
              const selected = reason === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReason(opt.value)}
                  className={cn(
                    "tap-spring flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors",
                    selected
                      ? "border-point-500 bg-point-100"
                      : "border-stroke-thin bg-bg-normal",
                  )}
                >
                  <span
                    className={cn(
                      "text-body-1 font-bold",
                      selected ? "text-point-600" : "text-fg-secondary",
                    )}
                  >
                    {opt.label}
                  </span>
                  {selected && (
                    <Check className="size-5 shrink-0 text-point-500" />
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* 추가 의견 */}
        <Section title="더 나은 서비스를 위한 의견 (선택)">
          <div className="rounded-2xl bg-bg-normal px-4 py-3.5 shadow-sm">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="불편했던 점이나 개선 의견을 자유롭게 남겨주세요."
              className={cn(
                "w-full resize-none bg-transparent text-body-1 font-bold text-fg-primary",
                "placeholder:font-normal placeholder:text-fg-tertiary",
                "focus:outline-none",
              )}
            />
          </div>
        </Section>

        {/* 비밀번호 확인 */}
        <Section title="비밀번호 확인">
          <div className="rounded-2xl bg-bg-normal px-4 shadow-sm">
            <div className="flex flex-col gap-1.5 py-3.5">
              <span className="text-caption-2 font-bold text-fg-tertiary">
                현재 비밀번호
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호 입력"
                className={cn(
                  "w-full bg-transparent text-body-1 font-bold text-fg-primary",
                  "placeholder:font-normal placeholder:text-fg-tertiary",
                  "focus:outline-none",
                )}
              />
            </div>
          </div>
        </Section>

        {error && (
          <p className="text-center text-caption-1 font-bold text-fg-warning">
            {error}
          </p>
        )}
      </div>

      {/* 탈퇴하기 (고정) */}
      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-screen-sm border-t border-stroke-thin bg-bg-page/95 px-5 py-4 backdrop-blur md:max-w-screen-md lg:max-w-screen-lg">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || deleteAccount.isPending}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-fg-warning text-base font-bold text-fg-inverse transition-opacity hover:opacity-90 disabled:bg-bg-disabled disabled:text-fg-disabled disabled:opacity-100"
        >
          {deleteAccount.isPending && <Loader2 className="size-4 animate-spin" />}
          {deleteAccount.isPending ? "탈퇴 처리 중…" : "탈퇴하기"}
        </button>
      </div>
    </div>
  );
}

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
