import { ApiError } from "@/lib/api-client";
import type { UploadResult } from "@/features/user/api/user.types";

/**
 * POST /api/uploads/image — 범용 이미지 업로드.
 * 영수증·프로필 사진 등 어떤 용도든 이 한 엔드포인트로 올라간다.
 * 반환되는 UploadResult.url 을 호출자가 도메인 객체(정산/유저/...)에 붙여 저장.
 * multipart/form-data field: file
 */
export const uploadImage = async (file: File): Promise<UploadResult> => {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/uploads/image", {
    method: "POST",
    body: fd,
    credentials: "same-origin",
  });
  const data = await res.text().then((t) => {
    if (!t) return null;
    try {
      return JSON.parse(t);
    } catch {
      return t;
    }
  });
  if (!res.ok) throw new ApiError(res.status, data);
  return data as UploadResult;
};
