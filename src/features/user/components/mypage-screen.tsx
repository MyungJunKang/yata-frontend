"use client";

import { YataLogo } from "@/components/ui/yata-logo";
import {
  useUserQuery,
  useUserStatsQuery,
} from "@/features/user/api/use-user";
import { ProfileCard } from "@/features/user/components/profile-card";
import { StatsCards } from "@/features/user/components/stats-cards";
import { RecentRides } from "@/features/user/components/recent-rides";
import { AccountSettings } from "@/features/user/components/account-settings";

export function MyPageScreen() {
  const userQuery = useUserQuery();
  const statsQuery = useUserStatsQuery();

  return (
    <div className="flex w-full flex-col">
      <header className="flex h-14 w-full items-center justify-end border-b border-stroke-thin bg-bg-normal px-5">
        <YataLogo />
      </header>
      <div className="flex w-full flex-col gap-[22px] px-5 pb-2 pt-4">
        <ProfileCard user={userQuery.data} isLoading={userQuery.isLoading} />
        <StatsCards
          stats={statsQuery.data}
          isLoading={statsQuery.isLoading}
        />
        <RecentRides />
        <AccountSettings />
      </div>
    </div>
  );
}
