"use client";

import * as React from "react";

import { Combobox } from "@/components/ui/combobox";
import { SSU_DEPARTMENTS } from "@/features/auth/lib/ssu-departments";
import { useDepartmentsQuery } from "@/features/auth/api/use-departments";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
};

export function DepartmentCombobox({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "학과 선택",
  invalid,
}: Props) {
  // 학과 목록은 API 우선, 로딩/실패 시 로컬 상수로 폴백
  const { data } = useDepartmentsQuery();
  const options = React.useMemo(() => {
    const names =
      data && data.length > 0 ? data.map((d) => d.name) : SSU_DEPARTMENTS;
    return names.map((n) => ({ label: n, value: n }));
  }, [data]);

  return (
    <Combobox
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      options={options}
      placeholder={placeholder}
      invalid={invalid}
      searchable
      searchPlaceholder="학과 검색"
    />
  );
}
