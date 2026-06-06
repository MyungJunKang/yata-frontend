import { Suspense } from "react";

import { ResetPasswordView } from "@/features/auth/components/reset-password-view";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-bg-normal px-5 pb-6">
      <Suspense fallback={null}>
        <ResetPasswordView />
      </Suspense>
    </div>
  );
}
