export const messageKeys = {
  all: ["messages"] as const,
  list: (roomId: string) =>
    [...messageKeys.all, "list", roomId] as const,
};
