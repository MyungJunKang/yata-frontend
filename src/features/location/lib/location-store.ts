import type { LocationResult } from "@/features/location/api/location.types";

export type LocationKind = "from" | "to";

const RECENT_KEY = "yata.location.recent";
const MAX_RECENT = 5;

/** 자주 쓰는 장소 빠른 선택용. localStorage 영속. */
export function readRecentLocations(): LocationResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocationResult[];
  } catch {
    return [];
  }
}

export function pushRecentLocation(loc: LocationResult) {
  if (typeof window === "undefined") return;
  const prev = readRecentLocations();
  const key = `${loc.name}|${loc.lat.toFixed(5)}|${loc.lng.toFixed(5)}`;
  const filtered = prev.filter(
    (p) => `${p.name}|${p.lat.toFixed(5)}|${p.lng.toFixed(5)}` !== key,
  );
  const next = [loc, ...filtered].slice(0, MAX_RECENT);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}
