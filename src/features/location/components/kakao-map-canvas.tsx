"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";

import {
  loadKakaoSdk,
  type KakaoCustomOverlay,
  type KakaoLatLng,
  type KakaoMap,
} from "@/features/location/lib/kakao-loader";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  /** 마커에 표시할 짧은 텍스트 (업체명 등). 길면 자동 truncate. */
  label?: string;
};

type FitPadding =
  | number
  | { top?: number; right?: number; bottom?: number; left?: number };

type Props = {
  center: { lat: number; lng: number };
  onCenterChanged?: (lat: number, lng: number) => void;
  markers?: MapMarker[];
  selectedMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
  onLongPress?: (lat: number, lng: number) => void;
  fitMarkers?: boolean;
  fitPadding?: FitPadding;
  showCenterPin?: boolean;
};

type StoredOverlay = {
  overlay: KakaoCustomOverlay;
  el: HTMLElement;
  label: string;
  lat: number;
  lng: number;
};

function truncateLabel(s: string, max = 9): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export function KakaoMapCanvas({
  center,
  onCenterChanged,
  markers,
  selectedMarkerId,
  onMarkerClick,
  onLongPress,
  fitMarkers = true,
  fitPadding = 64,
  showCenterPin = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  // 마커 overlay 를 id 기준으로 보관 — diff 기반 동기화로 detach/re-attach race 차단
  const overlaysRef = useRef<Map<string, StoredOverlay>>(new Map());
  // idle 콜백이 위로 흘려보낸 좌표. 같은 값이 prop 으로 돌아오면 panTo 스킵.
  const lastEmittedCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  // setBounds 를 같은 structureKey 에 대해 단 1회만 실행하도록 추적
  const lastFittedKeyRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const onCenterChangedRef = useRef(onCenterChanged);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onLongPressRef = useRef(onLongPress);
  const selectedMarkerIdRef = useRef(selectedMarkerId);
  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged;
  }, [onCenterChanged]);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);
  useEffect(() => {
    onLongPressRef.current = onLongPress;
  }, [onLongPress]);
  useEffect(() => {
    selectedMarkerIdRef.current = selectedMarkerId;
  }, [selectedMarkerId]);

  // SDK + 지도 초기화 (한 번만)
  useEffect(() => {
    let cancelled = false;
    let pressTimer: number | null = null;
    let pressLatLng: KakaoLatLng | null = null;
    let pressStartXY: { x: number; y: number } | null = null;
    const PRESS_DURATION_MS = 550;
    const PRESS_MOVE_THRESHOLD_PX = 8;

    const clearPress = () => {
      if (pressTimer !== null) {
        window.clearTimeout(pressTimer);
        pressTimer = null;
      }
      pressLatLng = null;
      pressStartXY = null;
    };

    loadKakaoSdk()
      .then((kakao) => {
        if (cancelled || !containerRef.current) return;
        if (!mapRef.current) {
          mapRef.current = new kakao.maps.Map(containerRef.current, {
            center: new kakao.maps.LatLng(center.lat, center.lng),
            level: 4,
          });
          // 생성 시점의 center 를 priming → 첫 idle echo 차단
          lastEmittedCenterRef.current = { lat: center.lat, lng: center.lng };
          const map = mapRef.current;

          // eslint-disable-next-line no-console
          console.log("[KakaoMap] map created", {
            center,
            priming: lastEmittedCenterRef.current,
          });

          kakao.maps.event.addListener(map, "idle", () => {
            const c = map.getCenter();
            const lat = c.getLat();
            const lng = c.getLng();
            lastEmittedCenterRef.current = { lat, lng };
            // eslint-disable-next-line no-console
            console.log("[KakaoMap] idle ->", lat, lng);
            onCenterChangedRef.current?.(lat, lng);
          });

          kakao.maps.event.addListener(map, "mousedown", (e) => {
            if (!e?.latLng) return;
            pressLatLng = e.latLng;
            pressTimer = window.setTimeout(() => {
              if (pressLatLng && onLongPressRef.current) {
                onLongPressRef.current(
                  pressLatLng.getLat(),
                  pressLatLng.getLng(),
                );
              }
              pressTimer = null;
            }, PRESS_DURATION_MS);
          });
          kakao.maps.event.addListener(map, "mouseup", clearPress);
          kakao.maps.event.addListener(map, "dragstart", clearPress);
        }

        const container = containerRef.current;
        const onPointerDown = (e: PointerEvent) => {
          pressStartXY = { x: e.clientX, y: e.clientY };
        };
        const onPointerMove = (e: PointerEvent) => {
          if (!pressStartXY) return;
          const dx = e.clientX - pressStartXY.x;
          const dy = e.clientY - pressStartXY.y;
          if (Math.hypot(dx, dy) > PRESS_MOVE_THRESHOLD_PX) clearPress();
        };
        const onPointerUp = () => clearPress();
        container?.addEventListener("pointerdown", onPointerDown);
        container?.addEventListener("pointermove", onPointerMove);
        container?.addEventListener("pointerup", onPointerUp);
        container?.addEventListener("pointercancel", onPointerUp);

        setIsReady(true);
      })
      .catch((e: Error) => setError(e.message));

    return () => {
      cancelled = true;
      clearPress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 컴포넌트 언마운트 시 모든 overlay detach (마운트/언마운트에서만 실행)
  useEffect(() => {
    const store = overlaysRef.current;
    return () => {
      store.forEach((s) => s.overlay.setMap(null));
      store.clear();
      lastFittedKeyRef.current = null;
    };
  }, []);

  // 외부 center 변경 → 지도 이동 (idle echo 는 1e-5 / ~1m 이내 차단)
  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined" || !window.kakao)
      return;
    const last = lastEmittedCenterRef.current;
    if (
      last &&
      Math.abs(last.lat - center.lat) < 1e-5 &&
      Math.abs(last.lng - center.lng) < 1e-5
    ) {
      // eslint-disable-next-line no-console
      console.log("[KakaoMap] center effect skip (echo)", { center, last });
      return;
    }
    // eslint-disable-next-line no-console
    console.log("[KakaoMap] panTo ->", center);
    const latLng = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.panTo(latLng);
    // center.lat/lng 만으로 충분 — center 객체 전체는 의도적으로 dep 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);

  // markers id+좌표 구조 키 — 같은 구조면 fit 1회만
  const structureKey = useMemo(
    () =>
      (markers ?? [])
        .map((m) => `${m.id}@${m.lat.toFixed(6)},${m.lng.toFixed(6)}`)
        .join("|"),
    [markers],
  );

  // 마커 diff 동기화 (cleanup 없음 — detach/re-attach race 차단)
  // 핵심 보수성: markers 가 undefined/빈 배열이면 기존 마커를 절대 제거하지 않음.
  // 새 마커 셋이 도착했을 때만 (그리고 그 안에 없는 id 만) 제거.
  useEffect(() => {
    if (!isReady || !mapRef.current || typeof window === "undefined") return;
    if (!markers || markers.length === 0) {
      // eslint-disable-next-line no-console
      console.log("[KakaoMap] marker diff skip (empty markers)", {
        structureKey,
        kept: overlaysRef.current.size,
      });
      return;
    }
    const kakao = window.kakao;
    const map = mapRef.current;
    const next = new Map(markers.map((m) => [m.id, m] as const));

    let removed = 0;
    let added = 0;
    let movedCount = 0;

    // 1) 사라진 id 제거 (next 가 비어있지 않음이 위에서 보장됨)
    overlaysRef.current.forEach((stored, id) => {
      if (!next.has(id)) {
        stored.overlay.setMap(null);
        overlaysRef.current.delete(id);
        removed += 1;
      }
    });

    // 2) 신규/좌표변경 처리
    next.forEach((m, id) => {
      const existing = overlaysRef.current.get(id);
      const label = truncateLabel(m.label ?? "");
      if (!existing) {
        const el = document.createElement("div");
        el.style.cursor = "pointer";
        el.innerHTML = renderMarkerHtml({
          label,
          selected: selectedMarkerIdRef.current === id,
        });
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onMarkerClickRef.current?.(id);
        });
        const overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(m.lat, m.lng),
          content: el,
          yAnchor: 1,
          zIndex: 10,
          clickable: true,
        });
        overlay.setMap(map);
        overlaysRef.current.set(id, {
          overlay,
          el,
          label,
          lat: m.lat,
          lng: m.lng,
        });
        added += 1;
      } else if (existing.lat !== m.lat || existing.lng !== m.lng) {
        existing.overlay.setPosition(new kakao.maps.LatLng(m.lat, m.lng));
        existing.lat = m.lat;
        existing.lng = m.lng;
        movedCount += 1;
      }
    });

    // eslint-disable-next-line no-console
    console.log("[KakaoMap] marker diff", {
      structureKey,
      added,
      removed,
      moved: movedCount,
      total: overlaysRef.current.size,
    });
    // markers 는 의도적으로 dep 제외 — structureKey 가 내용을 대표하므로 ref-only 변화로 재실행 X
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structureKey, isReady]);

  // fitBounds 는 structureKey 단위로 1회만
  useEffect(() => {
    if (!isReady || !mapRef.current || typeof window === "undefined") return;
    if (!fitMarkers) return;
    if (!markers || markers.length === 0) {
      // 마커 비었으면 다음번 새 마커 셋이 들어왔을 때 다시 fit 하도록 초기화
      lastFittedKeyRef.current = null;
      return;
    }
    if (lastFittedKeyRef.current === structureKey) return;

    const kakao = window.kakao;
    const bounds = new kakao.maps.LatLngBounds();
    markers.forEach((m) =>
      bounds.extend(new kakao.maps.LatLng(m.lat, m.lng)),
    );
    if (bounds.isEmpty()) return;

    const p =
      typeof fitPadding === "number"
        ? {
            top: fitPadding,
            right: fitPadding,
            bottom: fitPadding,
            left: fitPadding,
          }
        : {
            top: fitPadding?.top ?? 64,
            right: fitPadding?.right ?? 64,
            bottom: fitPadding?.bottom ?? 64,
            left: fitPadding?.left ?? 64,
          };
    // eslint-disable-next-line no-console
    console.log("[KakaoMap] fitBounds", { structureKey, padding: p });
    mapRef.current.setBounds(bounds, p.top, p.right, p.bottom, p.left);
    lastFittedKeyRef.current = structureKey;
    // fitPadding 은 의도적으로 dep 제외 — 구조 단위 1회만 fit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structureKey, isReady, fitMarkers]);

  // 선택 상태만 innerHTML 갱신 (재생성 X)
  useEffect(() => {
    overlaysRef.current.forEach((s, id) => {
      s.el.innerHTML = renderMarkerHtml({
        label: s.label,
        selected: selectedMarkerId === id,
      });
    });
  }, [selectedMarkerId]);

  return (
    <div className="relative size-full">
      <div ref={containerRef} className="size-full" />
      {showCenterPin && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="-translate-y-3 drop-shadow-md">
            <MapPin className="size-9 fill-point-500 text-fg-inverse" />
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-page/90 p-6 text-center">
          <p className="text-body-2 text-fg-warning">{error}</p>
        </div>
      )}
    </div>
  );
}

function renderMarkerHtml({
  label,
  selected,
}: {
  label: string;
  selected: boolean;
}): string {
  const bodyBg = selected ? "#7048ff" : "#ffffff";
  const bodyColor = selected ? "#ffffff" : "#5b2fe0";
  const borderColor = selected ? "#5b2fe0" : "#a893ff";
  const ringScale = selected ? "1.08" : "1";
  return `
    <div style="
      position: relative;
      transform: scale(${ringScale});
      transition: transform 120ms ease-out;
      filter: drop-shadow(0 4px 8px rgba(112, 72, 255, 0.25));
    ">
      <div style="
        min-width: 28px;
        height: 28px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${bodyBg};
        color: ${bodyColor};
        border: 2px solid ${borderColor};
        border-radius: 999px;
        font-family: var(--font-body, system-ui);
        font-weight: 700;
        font-size: 12px;
        line-height: 1;
        white-space: nowrap;
      ">${label}</div>
      <div style="
        position: absolute;
        left: 50%;
        bottom: -7px;
        transform: translateX(-50%) rotate(45deg);
        width: 10px;
        height: 10px;
        background: ${bodyBg};
        border-right: 2px solid ${borderColor};
        border-bottom: 2px solid ${borderColor};
      "></div>
    </div>
  `;
}
