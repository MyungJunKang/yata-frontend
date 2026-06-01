import { api } from "@/lib/api-client";
import type {
  NearbyPlacesResponse,
  ReverseGeocodeResponse,
  SearchLocationResponse,
} from "@/features/location/api/location.types";

export const searchLocation = (q: string) =>
  api.get<SearchLocationResponse>("/api/location/search", { query: { q } });

export const reverseGeocode = (lat: number, lng: number) =>
  api.get<ReverseGeocodeResponse>("/api/location/reverse", {
    query: { lat, lng },
  });

export const getNearbyPlaces = (
  lat: number,
  lng: number,
  opts: { radius?: number; limit?: number } = {},
) =>
  api.get<NearbyPlacesResponse>("/api/location/nearby", {
    query: { lat, lng, ...opts },
  });
