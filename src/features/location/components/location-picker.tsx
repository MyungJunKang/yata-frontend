"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { ChevronLeft, MapPin, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getNearbyPlaces,
  reverseGeocode,
  searchLocation,
} from "@/features/location/api/location";
import type { LocationResult } from "@/features/location/api/location.types";
import {
  type LocationKind,
  pushRecentLocation,
  readRecentLocations,
} from "@/features/location/lib/location-store";
import {
  fromLocationAtom,
  toLocationAtom,
} from "@/features/location/store/location-atoms";
import type { MapMarker } from "@/features/location/components/kakao-map-canvas";

// 지도는 클라이언트 전용 + 페이지 진입 시에만 로드
const KakaoMapCanvas = dynamic(
  () =>
    import("@/features/location/components/kakao-map-canvas").then(
      (m) => m.KakaoMapCanvas,
    ),
  { ssr: false, loading: () => <MapSkeleton /> },
);

// 숭실대 정문 좌표 (기본 시작점)
const DEFAULT_CENTER = { lat: 37.4965, lng: 126.9572 };

type Props = {
  kind: LocationKind;
};

function getResultId(r: LocationResult): string {
  return r.id ?? `${r.name}|${r.lat.toFixed(5)},${r.lng.toFixed(5)}`;
}

export function LocationPicker({ kind }: Props) {
  const router = useRouter();
  const setFromAtom = useSetAtom(fromLocationAtom);
  const setToAtom = useSetAtom(toLocationAtom);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [selected, setSelected] = useState<LocationResult | null>(null);
  const [recents, setRecents] = useState<LocationResult[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<LocationResult[]>([]);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setRecents(readRecentLocations());
  }, []);

  // viewport 기반 nearby 자동 조회 (검색 활성 아닐 때만, 500ms 디바운스)
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const { places } = await getNearbyPlaces(center.lat, center.lng, {
          radius: 400,
          limit: 12,
        });
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.log("[LocationPicker] nearby places →", places.length);
        setNearbyPlaces(
          places.map((p) => ({
            id: p.id,
            name: p.name,
            address: p.address,
            lat: p.lat,
            lng: p.lng,
            category: p.category,
          })),
        );
      } catch {
        /* noop */
      }
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [center.lat, center.lng]);

  // 검색 디바운스
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!query.trim()) {
      // eslint-disable-next-line no-console
      console.log("[LocationPicker] query empty → setResults([])");
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const { results } = await searchLocation(query.trim());
        // eslint-disable-next-line no-console
        console.log(
          "[LocationPicker] search ok → setResults",
          results.length,
          "items",
        );
        setResults(results);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[LocationPicker] search failed → setResults([])", e);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  // 검색 결과가 있으면 검색 결과 마커, 없으면 viewport nearby 마커
  const markerSource: LocationResult[] =
    results.length > 0 ? results : nearbyPlaces;
  const hasMarkers = markerSource.length > 0;
  const searchActive = results.length > 0;

  const title = kind === "from" ? "출발지 선택" : "도착지 선택";

  const handlePickResult = (loc: LocationResult) => {
    setSelected(loc);
    setCenter({ lat: loc.lat, lng: loc.lng });
    setShowResults(false);
  };

  const handleMarkerClick = (id: string) => {
    const found = markerSource.find((r) => getResultId(r) === id);
    if (!found) return;
    setSelected(found);
    setShowResults(false);
  };

  const handleLongPress = async (lat: number, lng: number) => {
    // 즉시 임시 라벨로 선택 표시 (응답 기다리지 않고 반응형)
    setSelected({
      name: "지정한 위치",
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      lat,
      lng,
    });
    setCenter({ lat, lng });
    // 검색 모드 해제 → 마커 사라지고 중앙 핀이 long-press 위치에 표시
    setQuery("");
    setResults([]);
    setShowResults(false);

    const [reverseRes, nearbyRes] = await Promise.allSettled([
      reverseGeocode(lat, lng),
      getNearbyPlaces(lat, lng, { radius: 50, limit: 1 }),
    ]);
    const address =
      reverseRes.status === "fulfilled" ? reverseRes.value.address : null;
    const place =
      nearbyRes.status === "fulfilled"
        ? (nearbyRes.value.places[0] ?? null)
        : null;
    if (!place && !address) return;
    setSelected({
      name: place?.name ?? address ?? "지정한 위치",
      address: place
        ? place.address
        : (address ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`),
      lat,
      lng,
    });
  };

  const handleConfirm = () => {
    if (!selected) return;
    if (kind === "from") setFromAtom(selected);
    else setToAtom(selected);
    pushRecentLocation(selected);
    router.back();
  };

  const presetsAndRecents = useMemo(() => {
    const presets: LocationResult[] = [
      {
        name: "숭실대학교 정문",
        address: "서울 동작구 상도로 369",
        lat: 37.4965,
        lng: 126.9572,
      },
      {
        name: "숭실대학교 후문",
        address: "서울 동작구 사당로 143",
        lat: 37.498,
        lng: 126.961,
      },
      {
        name: "강남역",
        address: "서울 강남구 강남대로 396",
        lat: 37.497952,
        lng: 127.027637,
      },
      {
        name: "사당역",
        address: "서울 동작구 남부순환로 지하 2089",
        lat: 37.4766,
        lng: 126.9818,
      },
    ];
    return [...recents, ...presets].slice(0, 8);
  }, [recents]);

  const markers: MapMarker[] = useMemo(
    () =>
      markerSource.map((r) => ({
        id: getResultId(r),
        lat: r.lat,
        lng: r.lng,
        // 업체/지역명 (Kakao place_name)을 마커 라벨로 사용
        label: r.name,
      })),
    [markerSource],
  );

  const selectedMarkerId = selected ? getResultId(selected) : null;
  const dropdownOpen = showResults && (results.length > 0 || isSearching);

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
      {/* AppBar + Search */}
      <div className="relative z-20 flex flex-col gap-3 bg-bg-normal px-4 pb-3 pt-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로가기"
            className="flex size-10 items-center justify-center text-fg-primary"
          >
            <ChevronLeft className="size-6" />
          </button>
          <h1 className="text-strong-1 text-fg-primary">{title}</h1>
        </div>
        <label className="relative flex h-12 items-center">
          <Search className="absolute left-4 size-4 text-fg-tertiary" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="장소, 도로명, 지번으로 검색"
            className="size-full rounded-md bg-bg-subtle pl-10 pr-10 text-body-2 text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-1 focus:ring-stroke-point"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setShowResults(false);
                setResults([]);
              }}
              aria-label="입력 지우기"
              className="absolute right-3 flex size-7 items-center justify-center rounded-full bg-bg-normal text-fg-tertiary"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
      </div>

      {/* 자주 가는 곳 (검색 비어있을 때만) */}
      {!query && (
        <div className="border-b border-stroke-thin bg-bg-normal px-4 py-3">
          <p className="mb-2 text-caption-1 font-medium text-fg-secondary">
            {recents.length > 0 ? "최근 / 자주 가는 곳" : "자주 가는 곳"}
          </p>
          <div className="flex flex-wrap gap-2">
            {presetsAndRecents.map((p, i) => (
              <button
                key={`${p.name}-${i}`}
                type="button"
                onClick={() => handlePickResult(p)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-caption-1 transition-colors",
                  "border-stroke-thin bg-bg-subtle text-fg-secondary hover:border-stroke-point hover:text-fg-point",
                )}
              >
                <MapPin className="size-3" />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 지도 영역 (검색 결과 dropdown overlay 포함) */}
      <div className="relative flex-1 overflow-hidden">
        <KakaoMapCanvas
          center={center}
          onCenterChanged={(lat, lng) => setCenter({ lat, lng })}
          markers={hasMarkers ? markers : undefined}
          selectedMarkerId={selectedMarkerId}
          onMarkerClick={handleMarkerClick}
          onLongPress={handleLongPress}
          // 검색 모드일 때만 자동 fit. viewport nearby 마커는 fit 안 함 (시야 안정).
          fitMarkers={searchActive}
          fitPadding={
            dropdownOpen
              ? { top: 260, right: 48, bottom: 80, left: 48 }
              : { top: 80, right: 48, bottom: 80, left: 48 }
          }
          // 검색 모드가 아닐 땐 중앙 핀 노출 (long-press 위치 가늠용)
          showCenterPin={!searchActive}
        />

        {/* 검색 결과 dropdown */}
        {dropdownOpen && (
          <div className="absolute inset-x-3 top-3 z-30 max-h-[45%] overflow-hidden rounded-lg bg-bg-normal shadow-lg">
            <div className="flex items-center justify-between border-b border-stroke-thin px-4 py-2.5">
              <span className="text-caption-1 font-bold text-fg-secondary">
                {isSearching ? "검색 중…" : `${results.length}개 결과`}
              </span>
              <button
                type="button"
                onClick={() => setShowResults(false)}
                className="text-caption-1 font-medium text-fg-tertiary hover:text-fg-primary"
              >
                닫기
              </button>
            </div>
            <div className="max-h-[calc(45vh-44px)] overflow-y-auto">
              {results.length === 0 && !isSearching ? (
                <p className="px-4 py-6 text-center text-body-2 text-fg-tertiary">
                  검색 결과가 없어요.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {results.map((r, i) => {
                    const id = getResultId(r);
                    const isSelected = selectedMarkerId === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => handlePickResult(r)}
                          className={cn(
                            "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                            isSelected ? "bg-point-50" : "hover:bg-bg-elevated",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-caption-1 font-bold",
                              isSelected
                                ? "bg-point-500 text-fg-inverse"
                                : "border-2 border-stroke-point bg-bg-normal text-fg-point",
                            )}
                          >
                            {i + 1}
                          </span>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-body-1 text-fg-primary">
                              {r.name}
                            </span>
                            <span className="truncate text-caption-1 text-fg-tertiary">
                              {r.address}
                            </span>
                          </div>
                          {r.category && (
                            <span className="shrink-0 text-caption-1 text-fg-tertiary">
                              {r.category}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* 결과 있는데 dropdown 닫혀있을 때 다시 펼치는 버튼 */}
        {hasMarkers && !dropdownOpen && (
          <button
            type="button"
            onClick={() => setShowResults(true)}
            className="absolute left-1/2 top-3 z-20 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-bg-normal px-4 py-2 text-caption-1 font-bold text-fg-primary shadow-md hover:bg-bg-elevated"
          >
            <Search className="size-3.5" />
            검색 결과 {results.length}개 보기
          </button>
        )}
      </div>

      {/* 선택 결과 카드 + CTA */}
      <div className="border-t border-stroke-thin bg-bg-normal px-5 pb-5 pt-4 shadow-lg">
        <div className="mb-3 flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-fg-point" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-strong-1 text-fg-primary">
              {selected?.name ?? "지도를 움직여 위치를 정해보세요"}
            </span>
            {selected?.address && selected.address !== selected.name && (
              <span className="truncate text-caption-1 text-fg-tertiary">
                {selected.address}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="point"
          size="lg"
          className="w-full"
          onClick={handleConfirm}
          disabled={!selected}
        >
          이 위치로 선택
        </Button>
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="flex size-full items-center justify-center bg-bg-subtle">
      <p className="text-body-2 text-fg-tertiary">지도 불러오는 중…</p>
    </div>
  );
}
