import { YataLogo } from "@/components/ui/yata-logo";

export function HomeHeader() {
  return (
    <header className="flex h-14 w-full items-center justify-between">
      <p className="text-title-3 font-bold text-fg-primary">
        안녕하세요{" "}
        <span role="img" aria-label="waving hand">
          👋
        </span>
      </p>
      <YataLogo />
    </header>
  );
}
