import { SignupProvider } from "@/features/auth/components/signup-context";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SignupProvider>{children}</SignupProvider>;
}
