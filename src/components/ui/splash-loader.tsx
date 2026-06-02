import Image from "next/image";

import { cn } from "@/lib/utils";

type Props = {
  /** 마스코트 크기 (default 80) */
  size?: number;
  label?: string;
  className?: string;
};

/**
 * IntroSplash 에서 쓰는 마스코트 + motion-line 애니메이션을 재사용한
 * 인라인 로딩 표시. 전체 화면이 아닌 영역 안에서 쓸 수 있다.
 */
export function SplashLoader({
  size = 80,
  label = "잠시만 기다려 주세요…",
  className,
}: Props) {
  const widthPx = Math.round(size * 1.6);
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        className,
      )}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ width: widthPx, height: size }}
      >
        <span
          className="absolute left-1/2 top-[38%] h-[2px] -translate-x-1/2 rounded-full bg-gray-400/50 animate-motion-line [animation-delay:0s]"
          style={{ width: size * 0.32 }}
        />
        <span
          className="absolute left-1/2 top-[52%] h-[2px] -translate-x-1/2 rounded-full bg-gray-400/60 animate-motion-line [animation-delay:0.18s]"
          style={{ width: size * 0.4 }}
        />
        <span
          className="absolute left-1/2 top-[68%] h-[2px] -translate-x-1/2 rounded-full bg-gray-400/40 animate-motion-line [animation-delay:0.36s]"
          style={{ width: size * 0.24 }}
        />
        <Image
          src="/images/yata-mascot.png"
          alt="YATA 마스코트"
          width={size}
          height={Math.round(size * 0.98)}
          priority
          className="relative animate-mascot-drive will-change-transform"
        />
      </div>
      {label && (
        <p className="text-body-2 text-fg-tertiary">{label}</p>
      )}
    </div>
  );
}
