export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  activeRoom: () => [...userKeys.all, "active-room"] as const,
};
