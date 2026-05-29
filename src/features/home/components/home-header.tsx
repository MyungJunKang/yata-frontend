export function HomeHeader() {
  return (
    <header className="flex w-full items-center justify-between pt-4">
      <p className="text-title-3 font-bold text-fg-primary">
        안녕하세요{" "}
        <span role="img" aria-label="waving hand">
          👋
        </span>
      </p>
      <span
        aria-hidden
        className="font-display text-[20px] font-extrabold italic tracking-[-0.04em] text-fg-primary"
      >
        YATA
      </span>
    </header>
  );
}
