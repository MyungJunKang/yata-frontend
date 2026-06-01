export type LocationResult = {
  /** Kakao place id (없을 수 있음 — 도로명/지번 검색 시) */
  id?: string;
  name: string;
  /** 도로명 우선, 없으면 지번 */
  address: string;
  lat: number;
  lng: number;
  /** Kakao category_group_name */
  category?: string;
};

export type SearchLocationResponse = {
  results: LocationResult[];
};

export type ReverseGeocodeResponse = {
  address: string | null;
};

export type NearbyPlace = {
  id: string;
  name: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
};

export type NearbyPlacesResponse = {
  places: NearbyPlace[];
};
