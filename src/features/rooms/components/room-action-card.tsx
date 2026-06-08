"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, MapPin, Receipt, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  useCallTaxiMutation,
  useCancelCallMutation,
  useShareLocationMutation,
} from "@/features/rooms/api/use-room-actions";
import { useSettlementQuery } from "@/features/rooms/api/use-settlement";

type Props = {
  roomId: string;
  callStatus: string;
  isHost: boolean;
  onOpenMembers: () => void;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "택시 호출 대기 중",
  calling: "택시 호출 중",
  called: "택시 호출 완료",
  settling: "정산 중",
  completed: "이용 완료",
};

export function RoomActionCard({
  roomId,
  callStatus,
  isHost,
  onOpenMembers,
}: Props) {
  const router = useRouter();
  const callMutation = useCallTaxiMutation(roomId);
  const cancelMutation = useCancelCallMutation(roomId);
  const locationMutation = useShareLocationMutation(roomId);
  // 정산이 이미 게시된 상태면 호출 취소 불가 — react-query 가 같은 키를 캐시하므로 중복 fetch 가 아니다.
  const settlementQuery = useSettlementQuery(roomId);
  const hasSettlement = !!settlementQuery.data;

  // 위치 공유 일시적 피드백 (성공/실패 메시지)
  const [locationFeedback, setLocationFeedback] = useState<{
    tone: "info" | "error";
    text: string;
  } | null>(null);

  const statusLabel = STATUS_LABEL[callStatus] ?? "—";

  // 우측 주 버튼: pending=호출, called=취소, 그 외엔 없음
  const isCallPending = callMutation.isPending;
  const isCancelPending = cancelMutation.isPending;

  const mutationError =
    callMutation.error ?? cancelMutation.error ?? null;
  const errorMessage = mutationError
    ? mutationError instanceof ApiError
      ? mutationError.message
      : "요청을 처리하지 못했어요."
    : null;

  const handleShareLocation = () => {
    if (locationMutation.isPending) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationFeedback({
        tone: "error",
        text: "이 기기에서는 위치 공유를 지원하지 않아요.",
      });
      return;
    }
    setLocationFeedback({ tone: "info", text: "위치 공유 중…" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationMutation.mutate(
          {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          {
            onSuccess: () =>
              setLocationFeedback({
                tone: "info",
                text: "현재 위치를 공유했어요",
              }),
            onError: (err) =>
              setLocationFeedback({
                tone: "error",
                text:
                  err instanceof ApiError
                    ? err.message
                    : "위치 공유에 실패했어요. 다시 시도해 주세요.",
              }),
          },
        );
      },
      (err) => {
        // 권한 거부 / 위치 불가 / 타임아웃을 사용자 친화 메시지로 분리
        const text =
          err.code === err.PERMISSION_DENIED
            ? "위치 권한이 차단됐어요. 브라우저 설정에서 허용해 주세요."
            : err.code === err.POSITION_UNAVAILABLE
              ? "현재 위치를 가져올 수 없어요. 잠시 후 다시 시도해 주세요."
              : err.code === err.TIMEOUT
                ? "위치 조회에 시간이 너무 걸려요. 다시 시도해 주세요."
                : "위치 공유에 실패했어요. 다시 시도해 주세요.";
        setLocationFeedback({ tone: "error", text });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 },
    );
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl bg-bg-normal p-[18px] shadow-lg">
      {/* Row 1 */}
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-point-400">
          <CarFront className="size-[22px] text-fg-inverse" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-eyebrow text-fg-point">
            택시 호출 현황
          </span>
          <span className="truncate text-[14px] font-bold text-fg-primary">
            {statusLabel}
          </span>
        </div>
        {callStatus === "pending" && isHost && (
          <Button
            variant="point"
            size="md"
            className="h-10 shrink-0 rounded-sm px-4"
            disabled={isCallPending}
            onClick={() => {
              if (isCallPending) return;
              callMutation.mutate();
            }}
          >
            {isCallPending ? "처리 중…" : "택시 호출"}
          </Button>
        )}
        {callStatus === "pending" && !isHost && (
          <span className="shrink-0 rounded-full bg-bg-subtle px-3 py-1.5 text-caption-1 font-bold text-fg-tertiary">
            호스트 대기 중
          </span>
        )}
        {callStatus === "called" && isHost && (
          <Button
            variant="point"
            size="md"
            className="h-10 shrink-0 rounded-sm px-4"
            disabled={isCancelPending || hasSettlement}
            title={
              hasSettlement
                ? "정산이 시작돼 호출을 취소할 수 없어요"
                : undefined
            }
            onClick={() => {
              if (isCancelPending || hasSettlement) return;
              cancelMutation.mutate();
            }}
          >
            {isCancelPending ? "처리 중…" : "호출 취소"}
          </Button>
        )}
      </div>

      {/* 호출 완료 + 호스트 → 도착/정산 진입 */}
      {callStatus === "called" && isHost && (
        <button
          type="button"
          onClick={() => router.push(`/room/${roomId}/settlement`)}
          className="flex h-12 w-full items-center justify-center gap-1.5 rounded-md bg-point-500 font-bold text-fg-inverse hover:bg-point-600"
        >
          <Receipt className="size-4" />
          도착했어요 · 정산하기
        </button>
      )}

      {/* Row 2 */}
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={handleShareLocation}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-gray-100 text-strong-2 text-fg-primary"
        >
          <MapPin className="size-4" />
          실시간 위치 공유
        </button>
        <button
          type="button"
          onClick={onOpenMembers}
          // 시안 액세서리 시안색은 세만틱 토큰이 없어 arbitrary 값 사용
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-[#2FDBFF]/30 text-strong-2 text-point-600"
        >
          <Users className="size-4" />
          탑승 인원 정보
        </button>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg bg-red-100 px-3 py-2 text-caption-1 text-fg-warning"
        >
          {errorMessage}
        </p>
      )}

      {locationFeedback && (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-caption-1",
            locationFeedback.tone === "error"
              ? "bg-red-100 text-fg-warning"
              : "bg-bg-subtle text-fg-secondary",
          )}
        >
          {locationFeedback.text}
        </p>
      )}
    </div>
  );
}
