"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import {
  ArrowUpDown,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  Car,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { useCreateRoomMutation } from "@/features/rooms/api/use-create-room";
import { usePaymentAccountQuery } from "@/features/user/api/use-user";
import type { CreateRoomBody } from "@/features/rooms/api/room.types";
import { ApiError } from "@/lib/api-client";
import {
  createFromLocationAtom,
  createToLocationAtom,
} from "@/features/location/store/location-atoms";
import { useFareEstimate } from "@/features/fare/api/use-fare-estimate";
import type { FareEstimateRequest } from "@/features/fare/api/fare.types";
import { TimePickerSheet } from "@/features/rooms/components/time-picker-sheet";

type GenderPolicyChoice = "all" | "same";

const GENDER_OPTIONS = [
  { label: "상관없음", value: "all" as const },
  { label: "동성만", value: "same" as const },
];

function formatAmPm(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const period = h < 12 ? "오전" : "오후";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${display}:${m}`;
}

function roundUpToNext5Min(d: Date): Date {
  const out = new Date(d);
  const minutes = out.getMinutes();
  const remainder = minutes % 5 === 0 ? 0 : 5 - (minutes % 5);
  out.setMinutes(minutes + remainder, 0, 0);
  return out;
}

function toHHMMValue(d: Date): string {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/** ApiError body 에서 서버 에러 코드 추출 (예: ALREADY_IN_ROOM) */
function getApiErrorCode(err: unknown): string | undefined {
  if (
    err instanceof ApiError &&
    err.body &&
    typeof err.body === "object" &&
    "code" in err.body
  ) {
    return String((err.body as { code: unknown }).code);
  }
  return undefined;
}

export function CreateRoomForm() {
  const router = useRouter();
  const [from, setFrom] = useAtom(createFromLocationAtom);
  const [to, setTo] = useAtom(createToLocationAtom);
  const [departTime, setDepartTime] = useState<Date>(() =>
    roundUpToNext5Min(new Date()),
  );
  const [capacity, setCapacity] = useState(3);
  const [genderChoice, setGenderChoice] = useState<GenderPolicyChoice>("all");
  const [message, setMessage] = useState("");
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [alreadyInRoomOpen, setAlreadyInRoomOpen] = useState(false);
  // 정산 계좌 미등록 시 방 생성 차단 — 안내 후 계좌 등록 화면으로 유도.
  const [accountGuardOpen, setAccountGuardOpen] = useState(false);
  const mutation = useCreateRoomMutation();
  const paymentAccountQuery = usePaymentAccountQuery();
  // 404 → data undefined + isError. 등록되어 있으면 data 가 채워진다.
  const hasPaymentAccount =
    !paymentAccountQuery.isLoading && !!paymentAccountQuery.data;

  const fareBody: FareEstimateRequest | null = useMemo(() => {
    if (!from || !to) return null;
    return {
      fromLat: from.lat,
      fromLng: from.lng,
      toLat: to.lat,
      toLng: to.lng,
      departAt: departTime.toISOString(),
    };
  }, [from, to, departTime]);

  const fareQuery = useFareEstimate(fareBody);
  const totalFare = fareQuery.data?.totalFare ?? null;
  const farePerPerson = useMemo(() => {
    if (totalFare == null) return null;
    // 1인 부담은 항상 100원 단위 올림. 합이 totalFare 보다 약간 많을 수 있어도 부족하지 않게.
    return Math.ceil(totalFare / capacity / 100) * 100;
  }, [totalFare, capacity]);
  const isExactSplit =
    totalFare != null &&
    farePerPerson != null &&
    farePerPerson * capacity === totalFare;
  const fareLabel =
    farePerPerson != null
      ? `${isExactSplit ? "" : "약 "}₩${farePerPerson.toLocaleString()}`
      : fareQuery.isFetching
        ? "계산 중…"
        : fareBody
          ? "—"
          : "출발/도착 선택 시";

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const isReady = !!from && !!to && totalFare != null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || totalFare == null) return;
    // 호스트는 정산을 받아야 하므로 본인 명의 계좌 등록이 선행 조건.
    if (!hasPaymentAccount) {
      setAccountGuardOpen(true);
      return;
    }
    const body: CreateRoomBody = {
      startPoint: from.name,
      startLat: from.lat,
      startLng: from.lng,
      endPoint: to.name,
      endLat: to.lat,
      endLng: to.lng,
      departAt: departTime.toISOString(),
      capacity,
      // genderChoice 는 "all" | "same" — 서버 genderPolicy enum 값과 동일
      genderPolicy: genderChoice,
      message,
      totalFare,
    };
    mutation.mutate(body, {
      onError: (err) => {
        // 이미 참여 중인 방이 있으면 인라인 에러 대신 안내 다이얼로그
        if (getApiErrorCode(err) === "ALREADY_IN_ROOM") {
          setAlreadyInRoomOpen(true);
        }
      },
    });
  };

  const isAlreadyInRoom =
    getApiErrorCode(mutation.error) === "ALREADY_IN_ROOM";
  const submitError = isAlreadyInRoom
    ? null
    : mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "방 만들기에 실패했어요. 잠시 후 다시 시도해 주세요."
        : null;

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 px-5">
      {/* 경로 */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col gap-3">
            <RouteRow
              label="출발지"
              value={from?.name ?? null}
              placeholder="출발지를 선택해 주세요"
              onClick={() =>
                router.push("/location-picker?kind=from&target=create")
              }
            />
            <RouteRow
              label="도착지"
              value={to?.name ?? null}
              placeholder="도착지를 선택해 주세요"
              onClick={() =>
                router.push("/location-picker?kind=to&target=create")
              }
            />
          </div>
          <button
            type="button"
            onClick={handleSwap}
            disabled={!from && !to}
            aria-label="출발/도착 바꾸기"
            className="flex size-9 items-center justify-center rounded-full bg-bg-normal text-fg-point ring-1 ring-stroke-thin disabled:opacity-40"
          >
            <ArrowUpDown className="size-4" />
          </button>
        </div>
      </Card>

      {/* 출발 시각 */}
      <Card>
        <h3 className="text-strong-1 text-fg-primary">출발 시각</h3>
        <div className="mt-3 flex items-center gap-2">
          <Pill active>오늘</Pill>
          <button
            type="button"
            onClick={() => setTimeSheetOpen(true)}
            aria-label="출발 시각 선택"
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-stroke-thin bg-bg-subtle text-strong-2 text-fg-primary transition-colors hover:border-stroke-point hover:text-fg-point"
          >
            {formatAmPm(departTime)}
          </button>
        </div>
      </Card>

      {/* 인원 + 1인 예상 부담금 */}
      <Card>
        <h3 className="text-strong-1 text-fg-primary">인원 (본인 포함)</h3>
        <div className="mt-3 flex items-center justify-between">
          <StepperButton
            aria-label="인원 감소"
            onClick={() => setCapacity((v) => Math.max(2, v - 1))}
            disabled={capacity <= 2}
          >
            <Minus className="size-5" />
          </StepperButton>
          <span className="text-title-2 text-fg-primary">{capacity}명</span>
          <StepperButton
            aria-label="인원 증가"
            onClick={() => setCapacity((v) => Math.min(4, v + 1))}
            disabled={capacity >= 4}
            primary
          >
            <Plus className="size-5" />
          </StepperButton>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-md bg-point-50 px-4 py-3">
          <span className="text-body-2 text-fg-secondary">
            1인 예상 부담금
            {fareQuery.data?.isLateNight && (
              <span className="ml-2 rounded-full bg-point-200 px-2 py-0.5 text-caption-1 text-fg-point">
                심야 20% 할증
              </span>
            )}
          </span>
          <div className="flex flex-col items-end leading-tight">
            <span className="text-strong-1 text-fg-point">{fareLabel}</span>
            {totalFare != null && (
              <span className="text-caption-1 text-fg-tertiary">
                총 ₩{totalFare.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 동승자 조건 */}
      <Card>
        <h3 className="text-strong-1 text-fg-primary">동승자 조건</h3>
        <div className="mt-3">
          <Segmented
            options={GENDER_OPTIONS}
            value={genderChoice}
            onChange={(v) => setGenderChoice(v)}
          />
        </div>
      </Card>

      {/* 메시지 */}
      <Card>
        <h3 className="flex items-center gap-2 text-strong-1 text-fg-primary">
          <MessageCircle className="size-4 text-fg-tertiary" />
          메시지 (선택)
        </h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="동승자에게 전할 메시지를 입력하세요"
          maxLength={200}
          rows={3}
          className="mt-3 w-full resize-none rounded-md bg-bg-subtle px-3 py-2.5 text-body-2 text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-1 focus:ring-stroke-point"
        />
      </Card>

      {submitError && (
        <p
          role="alert"
          className="rounded-sm bg-red-100 px-3 py-2 text-[12px] font-medium text-fg-warning"
        >
          {submitError}
        </p>
      )}

      <TimePickerSheet
        open={timeSheetOpen}
        initial={departTime}
        onClose={() => setTimeSheetOpen(false)}
        onConfirm={setDepartTime}
      />

      <ConfirmDialog
        open={accountGuardOpen}
        title="정산 계좌 등록이 필요해요"
        description="방을 만들려면 정산 받을 본인 명의 계좌가 먼저 등록되어 있어야 해요."
        confirmLabel="계좌 등록하러 가기"
        cancelLabel="나중에"
        onConfirm={() => {
          setAccountGuardOpen(false);
          router.push("/profile-edit");
        }}
        onCancel={() => setAccountGuardOpen(false)}
      />

      <AlertDialog
        open={alreadyInRoomOpen}
        title="이미 참여 중인 방이 있어요"
        description={
          mutation.error instanceof ApiError
            ? mutation.error.message
            : "기존 매칭이 끝나야 참여 가능합니다."
        }
        confirmLabel="내 방으로 가기"
        onClose={() => {
          setAlreadyInRoomOpen(false);
          router.replace("/home");
        }}
      />

      {/* 하단 sticky bar */}
      <div className="sticky bottom-0 -mx-5 mt-4 border-t border-stroke-thin bg-bg-normal px-5 pb-4 pt-3">
        <div className="flex items-end justify-between pb-3">
          <div className="flex flex-col leading-tight">
            <span className="text-caption-1 text-fg-tertiary">예상 출발</span>
            <span className="text-strong-2 text-fg-primary tabular">
              오늘 · {toHHMMValue(departTime)}
            </span>
          </div>
          <div className="flex flex-col items-end leading-tight">
            <span className="text-caption-1 text-fg-tertiary">1인 예상</span>
            <span className="text-strong-1 text-fg-point tabular">
              {fareLabel}
            </span>
          </div>
        </div>
        <Button
          type="submit"
          variant="point"
          size="lg"
          className="w-full"
          disabled={!isReady || mutation.isPending}
        >
          <Car className="size-5" />
          {mutation.isPending
            ? "방 만드는 중…"
            : isReady
              ? "방 만들고 동승자 모집하기"
              : "출발지·도착지를 선택해 주세요"}
        </Button>
      </div>
    </form>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-bg-normal p-4 shadow-sm">
      {children}
    </section>
  );
}

function RouteRow({
  label,
  value,
  placeholder,
  onClick,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md text-left transition-colors hover:bg-bg-elevated"
    >
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-point-500" />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-caption-1 text-fg-tertiary">{label}</span>
        <span
          className={cn(
            "truncate text-subtitle",
            value ? "text-fg-primary" : "text-fg-tertiary",
          )}
        >
          {value ?? placeholder}
        </span>
      </div>
      <ChevronRight className="size-4 shrink-0 text-fg-tertiary" />
    </button>
  );
}

function Pill({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full border px-4 text-strong-2",
        active
          ? "border-stroke-point bg-point-50 text-fg-point"
          : "border-stroke-thin bg-bg-subtle text-fg-secondary",
      )}
    >
      {children}
    </span>
  );
}

function StepperButton({
  children,
  onClick,
  disabled,
  primary,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-12 items-center justify-center rounded-full transition-colors",
        primary
          ? "bg-point-500 text-fg-inverse hover:bg-point-600 disabled:bg-bg-disabled disabled:text-fg-disabled"
          : "bg-bg-subtle text-fg-secondary hover:text-fg-primary disabled:opacity-50",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
