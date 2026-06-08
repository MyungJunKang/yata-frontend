import { cn } from "@/lib/utils";
import type { RideHistoryItem } from "@/features/user/api/user.types";

export function formatRideTime(iso: string | null): string {
  if (!iso) return "출발 시간 미정";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  const hh = d.getHours().toString().padStart(2, "0");
  const mi = d.getMinutes().toString().padStart(2, "0");
  return `${yyyy}.${mm}.${dd} · ${hh}:${mi}`;
}

export function RideCard({ ride }: { ride: RideHistoryItem }) {
  const isCompleted = ride.status === "completed";
  return (
    <div className="flex w-full flex-col gap-3.5 rounded-3xl bg-bg-normal p-5 shadow-sm">
      <div className="flex w-full items-start gap-3.5">
        {/* 좌측 출발→도착 connector */}
        <div className="flex h-14 w-2 shrink-0 flex-col items-center">
          <span className="size-2 rounded-full bg-point-500" />
          <span className="my-0.5 w-px flex-1 bg-point-200" />
          <span className="size-2 rounded-full bg-point-300" />
        </div>
        {/* 본문 */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-bold tracking-wider text-fg-tertiary">
              출발지
            </p>
            <p className="truncate text-[15px] font-bold text-fg-primary">
              {ride.startPoint}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-bold tracking-wider text-fg-tertiary">
              도착지
            </p>
            <p className="truncate text-[15px] font-bold text-fg-primary">
              {ride.endPoint}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-bold tracking-wider text-fg-tertiary">
          {isCompleted ? "이용 완료" : "취소됨"}
        </span>
      </div>
      <div className="h-px w-full bg-stroke-thin" />
      <div className="flex w-full items-end justify-between">
        <p className="text-[12px] text-fg-tertiary tabular">
          {formatRideTime(ride.departedAt)}
        </p>
        <div className="flex flex-col items-end gap-0.5 leading-tight">
          <p className="text-[11px] font-bold text-fg-tertiary">본인 부담</p>
          <div
            className={cn("flex items-baseline gap-0.5 text-fg-primary tabular")}
          >
            <span className="text-[22px] font-bold leading-none">
              {(ride.myFareWon ?? 0).toLocaleString()}
            </span>
            <span className="text-[14px] font-bold">원</span>
          </div>
        </div>
      </div>
    </div>
  );
}
