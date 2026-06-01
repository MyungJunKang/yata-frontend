export type FareEstimateRequest = {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  /** ISO string. 심야할증 계산에만 사용. */
  departAt: string;
};

export type FareBreakdown = {
  base: number;
  distanceFare: number;
  timeFare: number;
  /** 심야할증 등 배수. 1.0 = 할증 없음, 1.2 = 20% 할증 */
  surchargeMultiplier: number;
};

export type FareEstimateResponse = {
  /** 단위: m */
  distance: number;
  /** 단위: sec */
  duration: number;
  /** 100원 단위 반올림된 총 요금 */
  totalFare: number;
  isLateNight: boolean;
  breakdown: FareBreakdown;
};
