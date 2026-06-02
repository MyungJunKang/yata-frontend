"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { YataLogo } from "@/components/ui/yata-logo";
import { useActiveRoomQuery, useUserQuery } from "@/features/user/api/use-user";
import {
  useCreateSettlementMutation,
  useSettlementQuery,
} from "@/features/rooms/api/use-settlement";
import { formatDepartAt } from "@/features/rooms/lib/format";

type Props = {
  roomId: string;
};

export function SettlementScreen({ roomId }: Props) {
  const router = useRouter();
  const userQuery = useUserQuery();
  const activeRoomQuery = useActiveRoomQuery();
  const settlementQuery = useSettlementQuery(roomId);
  const createMutation = useCreateSettlementMutation(roomId);

  const room = activeRoomQuery.data?.room ?? null;
  const me = userQuery.data;
  const isHost = !!(me && room && room.members.some(
    (m) => m.userId === me.id && m.role === "host",
  ));
  const capacity = room?.joinedCount ?? 0;

  const [fareInput, setFareInput] = useState("");
  const totalFare = useMemo(() => {
    const n = Number(fareInput.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }, [fareInput]);
  const perPersonFare = useMemo(() => {
    if (!totalFare || capacity <= 0) return 0;
    return Math.ceil(totalFare / capacity / 100) * 100;
  }, [totalFare, capacity]);

  const submitError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? "정산 게시에 실패했어요."
        : null;

  // 이미 정산이 등록되어 있으면 view 모드
  if (settlementQuery.data) {
    return (
      <SettlementView
        roomId={roomId}
        onBack={() => router.back()}
        settlement={settlementQuery.data}
      />
    );
  }

  // 호스트가 아니면 안내만 표시
  if (room && me && !isHost) {
    return (
      <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
        <AppBar onBack={() => router.back()} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-strong-1 text-fg-primary">
            아직 정산 공지가 없어요.
          </p>
          <p className="text-body-2 text-fg-secondary">
            호스트가 택시비를 입력하고 정산을 시작할 때까지 기다려 주세요.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!totalFare || createMutation.isPending) return;
    createMutation.mutate(
      { totalFare },
      {
        onSuccess: () => router.push(`/room/${roomId}`),
      },
    );
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
      <AppBar onBack={() => router.back()} />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <h1 className="text-[24px] font-bold leading-tight tracking-tight text-fg-primary">
          택시비를 입력해 주세요
        </h1>

        {/* 실제 결제한 택시 요금 입력 */}
        <section className="flex flex-col gap-3 rounded-2xl bg-bg-normal p-[18px] shadow-sm">
          <p className="text-[13px] font-bold text-fg-secondary">
            실제 결제한 택시 요금
          </p>
          <label className="flex h-[60px] items-baseline justify-between gap-2 rounded-xl bg-bg-subtle px-[18px] py-3">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={fareInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setFareInput(raw ? Number(raw).toLocaleString() : "");
              }}
              placeholder="13,000"
              className="size-full bg-transparent text-[32px] font-bold tracking-tight text-fg-primary placeholder:text-fg-tertiary/60 focus:outline-none tabular"
              aria-label="실제 결제한 택시 요금"
            />
            <span className="shrink-0 text-base text-fg-tertiary">원</span>
          </label>
        </section>

        {/* 내 정산 계좌 */}
        <section className="flex flex-col gap-2.5 rounded-2xl bg-point-100 p-[18px]">
          <header className="flex items-center justify-between">
            <p className="text-caption-1 font-bold text-fg-secondary">
              내 정산 계좌
            </p>
            <button
              type="button"
              onClick={() => router.push("/mypage")}
              className="text-caption-1 font-bold text-fg-point"
            >
              프로필에서 변경 ›
            </button>
          </header>
          {/* TODO: 사용자 계좌 정보 API 연동. 현재 UserType 에 bank/accountNumber 없음 */}
          <p className="text-[17px] font-bold text-fg-primary">
            계좌 미등록
          </p>
          <p className="text-[15px] tracking-wide text-fg-tertiary">
            프로필 → 개인정보 수정에서 추가해 주세요.
          </p>
        </section>

        <p className="text-caption-1 font-bold text-fg-secondary">
          채팅방 미리보기
        </p>

        {/* 더치페이 공지 미리보기 */}
        <section className="flex flex-col gap-3 rounded-3xl border-[1.5px] border-stroke-point bg-bg-normal p-[18px]">
          <div className="flex items-center gap-2">
            <span className="size-7 shrink-0 rounded-full bg-point-400" />
            <p className="flex-1 truncate text-[13px] font-bold text-point-600">
              더치페이 공지
            </p>
            <p className="text-[10px] font-bold text-fg-tertiary">미리보기</p>
          </div>
          <p className="text-body-1 font-bold leading-snug text-fg-primary">
            택시비 정산 안내입니다 🚕
          </p>
          <div className="flex flex-col gap-1.5 rounded-xl bg-bg-subtle px-3.5 py-3">
            <PreviewRow
              label="총 금액"
              value={totalFare ? `₩${totalFare.toLocaleString()}` : "—"}
            />
            <PreviewRow label="인원" value={`${capacity}명`} />
            <div className="my-0.5 h-px w-full bg-stroke-thin" />
            <PreviewRow
              label="1인 부담"
              value={perPersonFare ? `₩${perPersonFare.toLocaleString()}` : "—"}
              accent
            />
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-point-100 px-3.5 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-point-600">
              입금 계좌
            </p>
            <p className="text-body-2 font-bold text-fg-primary">
              {me?.name ?? "—"}
            </p>
            <p className="text-body-2 text-fg-tertiary">계좌 미등록</p>
          </div>
        </section>

        {room && (
          <p className="px-1 text-caption-1 text-fg-tertiary">
            방: {room.startPoint} → {room.endPoint} ·{" "}
            {formatDepartAt(room.departAt)}
          </p>
        )}

        {submitError && (
          <p
            role="alert"
            className="rounded-sm bg-red-100 px-3 py-2 text-caption-1 font-medium text-fg-warning"
          >
            {submitError}
          </p>
        )}
      </div>

      {/* 하단 sticky CTA */}
      <div className="flex w-full flex-col items-center bg-bg-normal px-6 pb-7 pt-4">
        <Button
          variant="point"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={!totalFare || createMutation.isPending || !isHost}
        >
          {createMutation.isPending
            ? "공지 게시 중…"
            : isHost
              ? "채팅방에 공지 게시"
              : "호스트만 정산을 시작할 수 있어요"}
        </Button>
      </div>
    </div>
  );
}

function AppBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-14 w-full items-center justify-between border-b border-stroke-thin bg-bg-normal px-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex size-11 items-center justify-center text-fg-primary"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-[17px] font-bold text-fg-primary">정산하기</p>
      </div>
      <YataLogo />
    </div>
  );
}

function PreviewRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-caption-1 font-bold text-fg-tertiary">{label}</span>
      <span
        className={cn(
          "tabular",
          accent
            ? "text-[16px] font-bold text-fg-point"
            : "text-[13px] font-medium text-fg-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}

import type { Settlement } from "@/features/rooms/api/settlement.types";

function SettlementView({
  roomId,
  onBack,
  settlement,
}: {
  roomId: string;
  onBack: () => void;
  settlement: Settlement;
}) {
  return (
    <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
      <AppBar onBack={onBack} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <h1 className="text-[24px] font-bold leading-tight tracking-tight text-fg-primary">
          정산 공지
        </h1>
        <section className="flex flex-col gap-3 rounded-2xl bg-bg-normal p-[18px] shadow-sm">
          <PreviewRow
            label="총 금액"
            value={`₩${settlement.totalFare.toLocaleString()}`}
          />
          <PreviewRow label="인원" value={`${settlement.capacity}명`} />
          <div className="h-px w-full bg-stroke-thin" />
          <PreviewRow
            label="1인 부담"
            value={`₩${settlement.perPersonFare.toLocaleString()}`}
            accent
          />
        </section>
        {settlement.hostAccount && (
          <section className="flex flex-col gap-1 rounded-2xl bg-point-100 p-[18px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-point-600">
              입금 계좌
            </p>
            <p className="text-body-1 font-bold text-fg-primary">
              {settlement.hostAccount.bank} · {settlement.hostAccount.holder}
            </p>
            <p className="text-body-1 text-fg-secondary tracking-wide">
              {settlement.hostAccount.accountNumber}
            </p>
          </section>
        )}
        <section className="flex flex-col gap-2 rounded-2xl bg-bg-normal p-[18px] shadow-sm">
          <p className="text-caption-1 font-bold text-fg-secondary">
            송금 현황
          </p>
          <ul className="flex flex-col gap-1.5">
            {settlement.members.map((m) => (
              <li
                key={m.userId}
                className="flex items-center justify-between border-b border-stroke-thin py-1.5 last:border-b-0"
              >
                <span className="text-body-2 text-fg-primary">{m.name}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-caption-1 font-bold",
                    m.status === "paid"
                      ? "bg-point-100 text-fg-point"
                      : "bg-bg-subtle text-fg-tertiary",
                  )}
                >
                  {m.status === "paid" ? "송금 완료" : "대기 중"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {/* roomId 는 추후 송금 표시 액션에 사용 — 일단 placeholder */}
      <div className="hidden">{roomId}</div>
    </div>
  );
}
