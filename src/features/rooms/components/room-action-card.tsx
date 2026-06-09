"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CarFront,
  Loader2,
  MapPin,
  Receipt,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useCallTaxiMutation,
  useCancelCallMutation,
} from "@/features/rooms/api/use-room-actions";
import { useSettlementQuery } from "@/features/rooms/api/use-settlement";
import { useUserQuery } from "@/features/user/api/use-user";
import { useSendMessageMutation } from "@/features/messages/api/use-messages";
import {
  getNearbyPlaces,
  reverseGeocode,
} from "@/features/location/api/location";

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
  const userQuery = useUserQuery();
  const me = userQuery.data;
  // 위치 공유는 카카오맵 링크를 포함한 채팅 텍스트 메시지로 브로드캐스트.
  const sendLocationMessage = useSendMessageMutation(roomId, me);
  // 정산이 이미 게시된 상태면 호출 취소 불가 — react-query 가 같은 키를 캐시하므로 중복 fetch 가 아니다.
  const settlementQuery = useSettlementQuery(roomId);
  const settlement = settlementQuery.data;
  const hasSettlement = !!settlement;
  // 정산 멤버가 모두 송금 완료(paid 또는 confirmed) 이면 호스트 CTA 를 "송금 확인하기" 로 전환.
  const allMembersPaid =
    !!settlement &&
    !!settlement.members &&
    settlement.members.length > 0 &&
    settlement.members.every(
      (m) => m.status === "paid" || m.status === "confirmed",
    );

  // 위치 공유 일시적 피드백 (성공/실패 메시지)
  const [locationFeedback, setLocationFeedback] = useState<{
    tone: "info" | "error";
    text: string;
  } | null>(null);
  // 호스트 택시 호출 confirm — 다른 멤버에게 즉시 알림이 가니 의도치 않은 호출 방지.
  const [callConfirmOpen, setCallConfirmOpen] = useState(false);

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
    if (sendLocationMessage.isPending) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationFeedback({
        tone: "error",
        text: "이 기기에서는 위치 공유를 지원하지 않아요.",
      });
      return;
    }
    setLocationFeedback({ tone: "info", text: "위치 공유 중…" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        // 좌표 → 사람이 읽을 수 있는 장소명. 가장 가까운 POI(상호/건물) → 도로명 → 좌표 순으로 폴백.
        let label = await resolvePlaceLabel(lat, lng);
        if (!label) label = `내 위치 (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        const safeLabel = label.replace(/\]/g, ")");
        // 카카오맵 공유 링크 — 클릭하면 해당 좌표가 마커로 떠 있는 지도가 열림.
        // 마크다운 [text](url) 파싱과 충돌하지 않도록 URL 안의 괄호는 인코딩.
        const mapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(
          label,
        )},${lat.toFixed(6)},${lng.toFixed(6)}`
          .replace(/\(/g, "%28")
          .replace(/\)/g, "%29");
        const text = `📍 현재 위치를 공유했어요 - [${safeLabel}](${mapUrl})`;
        sendLocationMessage.mutate(
          { kind: "text", text },
          {
            onSuccess: () => setLocationFeedback(null),
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
              setCallConfirmOpen(true);
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

      {/* 호출 완료 + 호스트 → 도착/정산 진입.
          모든 멤버가 송금 완료 상태면 "송금 확인하기" 로 CTA 전환. */}
      {callStatus === "called" && isHost && (
        <button
          type="button"
          onClick={() => router.push(`/room/${roomId}/settlement`)}
          className="flex h-12 w-full items-center justify-center gap-1.5 rounded-md bg-point-500 font-bold text-fg-inverse hover:bg-point-600"
        >
          <Receipt className="size-4" />
          {allMembersPaid ? "송금 확인하기" : "도착했어요 · 정산하기"}
        </button>
      )}

      {/* Row 2 */}
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={handleShareLocation}
          disabled={sendLocationMessage.isPending}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-gray-100 text-strong-2 text-fg-primary disabled:opacity-60"
        >
          <MapPin className="size-4" />
          {sendLocationMessage.isPending ? "공유 중…" : "실시간 위치 공유"}
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
        <div
          role={locationFeedback.tone === "error" ? "alert" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-caption-1 font-medium",
            locationFeedback.tone === "error"
              ? "border-red-200 bg-red-50 text-fg-warning"
              : "border-point-200 bg-point-50 text-fg-point",
          )}
        >
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full",
              locationFeedback.tone === "error"
                ? "bg-red-100"
                : "bg-point-100",
            )}
          >
            {locationFeedback.tone === "error" ? (
              <AlertCircle className="size-3.5" />
            ) : (
              <Loader2 className="size-3.5 animate-spin" />
            )}
          </span>
          <span className="flex-1 leading-snug">{locationFeedback.text}</span>
        </div>
      )}

      <ConfirmDialog
        open={callConfirmOpen}
        title="택시를 호출하시겠어요?"
        description="호출 후에는 멤버가 방을 떠날 수 없어요. 멤버들을 모두 모은 뒤 호출해 주세요."
        confirmLabel="택시 호출"
        cancelLabel="취소"
        pending={isCallPending}
        onConfirm={() => {
          if (isCallPending) return;
          callMutation.mutate(undefined, {
            onSettled: () => setCallConfirmOpen(false),
          });
        }}
        onCancel={() => {
          if (isCallPending) return;
          setCallConfirmOpen(false);
        }}
      />
    </div>
  );
}

/**
 * 좌표를 사람이 읽기 쉬운 장소명으로 변환.
 * 가장 가까운 POI(상호/건물) → 도로명 주소 순으로 폴백, 둘 다 실패하면 null.
 */
async function resolvePlaceLabel(
  lat: number,
  lng: number,
): Promise<string | null> {
  try {
    const nearby = await getNearbyPlaces(lat, lng, { radius: 50, limit: 1 });
    const first = nearby.places[0];
    if (first?.name) return first.name;
  } catch {
    // POI 검색 실패는 무시 — 도로명으로 폴백
  }
  try {
    const rev = await reverseGeocode(lat, lng);
    if (rev.address) return rev.address;
  } catch {
    // 무시
  }
  return null;
}
