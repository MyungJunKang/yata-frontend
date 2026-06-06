"use client";

import { useQuery } from "@tanstack/react-query";

import { getDepartments } from "@/features/auth/api/meta";

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: ["meta", "departments"],
    queryFn: getDepartments,
    // 학과 목록은 거의 변하지 않음 → 길게 캐시
    staleTime: 1000 * 60 * 60,
  });
}
