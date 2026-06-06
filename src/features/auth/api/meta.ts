import { api } from "@/lib/api-client";

import type { Department } from "./meta.types";

export const getDepartments = () =>
  api.get<Department[]>("/api/meta/departments");
