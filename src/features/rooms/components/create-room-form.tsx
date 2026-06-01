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

import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import { useCreateRoomMutation } from "@/features/rooms/api/use-create-room";
import type { CreateRoomBody } from "@/features/rooms/api/room.types";
import { ApiError } from "@/lib/api-client";
import {
  fromLocationAtom,
  toLocationAtom,
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

function roundUpToNext30Min(d: Date): Date {
  const out = new Date(d);
  const minutes = out.getMinutes();
  const remainder = 30 - (minutes % 30);
  out.setMinutes(minutes + remainder, 0, 0);
  return out;
}

function toHHMMValue(d: Date): string {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function CreateRoomForm() {
  const router = useRouter();
  const [from, setFrom] = useAtom(fromLocationAtom);
  const [to, setTo] = useAtom(toLocationAtom);
  const [departTime, setDepartTime] = useState<Date>(() =>
    roundUpToNext30Min(new Date()),
  );
  const [capacity, setCapacity] = useState(3);
  const [genderChoice, setGenderChoice] = useState<GenderPolicyChoice>("all");
  const [message, setMessage] = useState("");
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const mutation = useCreateRoomMutation();

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

  const isReady = !!from && !!to;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    const body: CreateRoomBody = {
      startPoint: from.name,
      endPoint: to.name,
      departAt: departTime.toISOString(),
      capacity,
      // TODO: "동성만" 선택 시 본인 성별을 /me 등으로 받아와 male|female 로 보내야 함
      genderPolicy: genderChoice === "all" ? "all" : "male",
      message,
    };
    mutation.mutate(body);
  };

  const submitError =
    mutation.error instanceof ApiError
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
              onClick={() => router.push("/location-picker?kind=from")}
            />
            <RouteRow
              label="도착지"
              value={to?.name ?? null}
              placeholder="도착지를 선택해 주세요"
              onClick={() => router.push("/location-picker?kind=to")}
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
          placeholder="예: 시험 끝나고 바로 출발해요. 정문 스타벅스 앞에서 모여요!"
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

      {/* 하단 sticky bar */}
      <div className="sticky bottom-0 -mx-5 mt-4 border-t border-stroke-thin bg-bg-normal px-5 pb-4 pt-3">
        <div className="flex items-center justify-between pb-3">
          <div className="flex flex-col">
            <span className="text-caption-1 text-fg-tertiary">예상 출발</span>
            <span className="text-strong-2 text-fg-primary">
              오늘 · {toHHMMValue(departTime)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-caption-1 text-fg-tertiary">1인 예상</span>
            <span className="text-strong-1 text-fg-point">{fareLabel}</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={!isReady || mutation.isPending}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-point-500 text-base font-bold text-fg-inverse hover:bg-point-600 disabled:bg-bg-disabled disabled:text-fg-disabled"
        >
          <Car className="size-5" />
          {mutation.isPending
            ? "방 만드는 중…"
            : isReady
              ? "방 만들고 동승자 모집하기"
              : "출발지·도착지를 선택해 주세요"}
        </button>
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
