"use client";

import { Clock, PiggyBank } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserStatsResponse } from "@/features/user/api/user.types";

type Props = {
  stats?: UserStatsResponse;
  isLoading?: boolean;
};

export function StatsCards({ stats, isLoading }: Props) {
  return (
    <div className="flex w-full items-stretch gap-3.5">
      <StatCard
        icon={<Clock className="size-5 text-fg-secondary" />}
        label="총 이용 횟수"
        value={stats?.totalRides}
        unit="회"
        isLoading={isLoading}
      />
      <StatCard
        icon={<PiggyBank className="size-5 text-point-700" />}
        label="절약한 요금"
        value={stats?.savedAmountWon}
        unit="원"
        accent
        isLoading={isLoading}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  accent,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  unit: string;
  accent?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-start gap-2 rounded-3xl p-[18px] shadow-sm",
        accent ? "bg-point-400" : "bg-bg-normal",
      )}
    >
      <div className="size-5">{icon}</div>
      <p
        className={cn(
          "text-[12px] font-bold",
          accent ? "text-point-800/70" : "text-fg-secondary",
        )}
      >
        {label}
      </p>
      {isLoading ? (
        <span
          className={cn(
            "h-7 w-20 animate-pulse rounded",
            accent ? "bg-point-300/70" : "bg-bg-subtle",
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-baseline font-bold tabular",
            accent ? "text-point-700" : "text-fg-primary",
          )}
        >
          <span className="text-[26px] leading-none">
            {value != null ? value.toLocaleString() : "—"}
          </span>
          <span className="ml-0.5 text-[18px]">{unit}</span>
        </div>
      )}
    </div>
  );
}
