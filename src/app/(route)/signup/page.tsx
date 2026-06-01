import { AuthAppBar } from "@/features/auth/components/auth-app-bar";
import { SignupStepOneForm } from "@/features/auth/components/signup-step-one-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-bg-normal px-5 pb-6">
      <AuthAppBar backHref="/login" />
      <SignupStepOneForm />
      <p className="mt-6 text-center text-[12px] font-medium leading-[1.7] text-fg-tertiary">
        가입 시 이용약관에 동의하게 됩니다.
      </p>
    </div>
  );
}
