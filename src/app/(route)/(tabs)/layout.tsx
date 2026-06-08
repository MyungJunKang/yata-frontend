export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // BottomNav 는 root layout 에서 전역 1회 마운트. 여기서는 fixed nav 높이만큼 pb-24 만 책임진다.
  return (
    <div className="relative min-h-[100dvh] w-full pb-24">{children}</div>
  );
}
