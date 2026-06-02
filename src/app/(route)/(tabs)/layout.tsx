import { BottomNav } from "@/components/ui/bottom-nav";
import { RouteTransition } from "@/components/layout/route-transition";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] w-full pb-24">
      {/* BottomNav 는 transition 밖에 두어 라우트 전환 시 깜빡임 방지 */}
      <RouteTransition>{children}</RouteTransition>
      <BottomNav />
    </div>
  );
}
