"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * 라우트 전환 시 아주 짧은 opacity fade-in 만 적용.
 * - slide 없음 (정신없음 방지)
 * - 180ms 짧은 시간 + Apple easing
 * - 같은 path 안 (e.g. 쿼리만 변경) 에서는 재실행 안 함
 */
export function RouteTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    setSeed((s) => s + 1);
  }, [pathname]);

  return (
    <div
      key={seed}
      className="animate-in fade-in duration-150 [animation-timing-function:cubic-bezier(0.32,0.72,0,1)]"
    >
      {children}
    </div>
  );
}
