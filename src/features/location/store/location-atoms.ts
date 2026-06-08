import { atom } from "jotai";

import type { LocationResult } from "@/features/location/api/location.types";

/** location-picker 의 대상 — 방 검색(search) 과 방 생성(create) 의 상태를 분리. */
export type LocationTarget = "search" | "create";

// 방 검색 (home) — picker → 검색 필터로 사용.
export const searchFromLocationAtom = atom<LocationResult | null>(null);
export const searchToLocationAtom = atom<LocationResult | null>(null);

// 방 생성 (create-room) — picker → form payload 로 사용.
export const createFromLocationAtom = atom<LocationResult | null>(null);
export const createToLocationAtom = atom<LocationResult | null>(null);
