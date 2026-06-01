import { BottomNav } from "@/components/ui/bottom-nav";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] w-full pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
