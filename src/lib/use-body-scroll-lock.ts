"use client";

import { useEffect } from "react";

/**
 * body 스크롤을 막으면서 scrollbar 가 사라져 발생하는 가로 layout shift 를 방지한다.
 * documentElement.clientWidth 와 window.innerWidth 의 차이를 body 의 paddingRight 로 보정.
 *
 * locked=true 인 동안만 활성화되며, 해제 시 이전 inline style 을 복원한다.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [locked]);
}
