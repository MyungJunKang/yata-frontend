import type { GetRideHistoryParams } from "@/features/user/api/user.types";

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  activeRoom: () => [...userKeys.all, "active-room"] as const,
  rideHistory: (params: GetRideHistoryParams) =>
    [...userKeys.all, "ride-history", params] as const,
  paymentAccount: () => [...userKeys.all, "payment-account"] as const,
};
