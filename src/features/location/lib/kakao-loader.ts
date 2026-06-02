// Kakao Map SDK 한 번만 로드하기 위한 모듈 싱글톤
let kakaoLoadPromise: Promise<KakaoNamespace> | null = null;

declare global {
  interface Window {
    kakao: KakaoNamespace;
  }
}

export type KakaoLatLng = { getLat(): number; getLng(): number };

export type KakaoLatLngBounds = {
  extend(latLng: KakaoLatLng): void;
  isEmpty(): boolean;
};

export type KakaoCustomOverlay = {
  setMap(map: KakaoMap | null): void;
  setPosition(latLng: KakaoLatLng): void;
};

export type KakaoMap = {
  setCenter(latLng: KakaoLatLng): void;
  getCenter(): KakaoLatLng;
  panTo(latLng: KakaoLatLng): void;
  setLevel(level: number): void;
  setBounds(
    bounds: KakaoLatLngBounds,
    paddingTop?: number,
    paddingRight?: number,
    paddingBottom?: number,
    paddingLeft?: number,
  ): void;
};

export type KakaoNamespace = {
  maps: {
    load: (cb: () => void) => void;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    LatLngBounds: new () => KakaoLatLngBounds;
    Map: new (
      container: HTMLElement,
      opts: { center: KakaoLatLng; level: number },
    ) => KakaoMap;
    CustomOverlay: new (opts: {
      position: KakaoLatLng;
      content: HTMLElement | string;
      yAnchor?: number;
      xAnchor?: number;
      zIndex?: number;
      clickable?: boolean;
    }) => KakaoCustomOverlay;
    event: {
      addListener: (
        target: KakaoMap,
        event: string,
        handler: (payload?: { latLng: KakaoLatLng }) => void,
      ) => void;
    };
  };
};

export function loadKakaoSdk(): Promise<KakaoNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadKakaoSdk: SSR 환경에서 호출 불가"));
  }
  if (window.kakao && window.kakao.maps) {
    return Promise.resolve(window.kakao);
  }
  if (kakaoLoadPromise) return kakaoLoadPromise;

  const appkey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!appkey) {
    return Promise.reject(
      new Error(
        "NEXT_PUBLIC_KAKAO_JS_KEY 가 비어있어요. .env 에 키를 추가하세요.",
      ),
    );
  }

  kakaoLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao || !window.kakao.maps) {
        // 카카오 콘솔의 도메인 허용 거부 등 — sdk.js 응답이 비어있는 케이스
        kakaoLoadPromise = null;
        script.remove();
        reject(
          new Error(
            "Kakao SDK 로드 실패 — 카카오 개발자 콘솔 플랫폼 도메인에 현재 origin 이 등록되어 있는지 확인하세요.",
          ),
        );
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => {
      // 실패한 promise 를 module scope 에 남기지 않음 → 다음 호출 시 재시도 가능
      kakaoLoadPromise = null;
      script.remove();
      reject(new Error("Kakao SDK 로드 실패 — 네트워크 또는 도메인 차단."));
    };
    document.head.appendChild(script);
  });
  return kakaoLoadPromise;
}
