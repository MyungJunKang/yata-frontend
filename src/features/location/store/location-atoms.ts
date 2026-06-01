import { atom } from "jotai";

import type { LocationResult } from "@/features/location/api/location.types";

// picker → form 으로 전달용 전역 atom. SPA 세션 동안 메모리에 유지.
export const fromLocationAtom = atom<LocationResult | null>(null);
export const toLocationAtom = atom<LocationResult | null>(null);
