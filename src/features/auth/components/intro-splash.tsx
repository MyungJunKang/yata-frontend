"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { isAuthenticated } from "@/features/auth/lib/auth-storage";

export function IntroSplash() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace(isAuthenticated() ? "/home" : "/login");
    }, 1000);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-page px-6">
      <div className="relative flex h-[125px] w-[200px] items-center justify-center overflow-hidden">
        <span className="absolute left-1/2 top-[38%] h-[3px] w-8 -translate-x-1/2 rounded-full bg-gray-400/50 animate-motion-line [animation-delay:0s]" />
        <span className="absolute left-1/2 top-[52%] h-[3px] w-10 -translate-x-1/2 rounded-full bg-gray-400/60 animate-motion-line [animation-delay:0.18s]" />
        <span className="absolute left-1/2 top-[68%] h-[3px] w-6 -translate-x-1/2 rounded-full bg-gray-400/40 animate-motion-line [animation-delay:0.36s]" />
        <Image
          src="/images/yata-mascot.png"
          alt="YATA 마스코트"
          width={127}
          height={125}
          priority
          className="relative animate-mascot-drive will-change-transform"
        />
      </div>
      <h1 className="mt-2 font-display text-[44px] font-extrabold italic leading-none tracking-[-0.05em] text-fg-primary">
        YATA
      </h1>
      <p className="mt-3 text-[15px] font-medium leading-[1.5] text-fg-secondary text-center">
        숭실대학교 학생들을 위한
        <br />
        택시 공유 서비스
      </p>
    </div>
  );
}
