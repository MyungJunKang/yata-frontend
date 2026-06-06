import { YataLogo } from "@/components/ui/yata-logo";

export function HomeHeader() {
  return (
    <header className="-mx-5 flex h-14 items-center justify-between border-b border-stroke-thin bg-bg-normal px-5">
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
