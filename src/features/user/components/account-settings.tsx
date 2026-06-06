"use client";

import { useRouter } from "next/navigation";
import {
  ChevronRight,
  FileText,
  LogOut,
  UserCog,
  UserX,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSignOut } from "@/features/auth/api/use-sign-out";

type RowProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
};

export function AccountSettings() {
  const router = useRouter();
  const signOut = useSignOut();

  const handleEditProfile = () => {
    router.push("/profile-edit");
  };
  const handleTerms = () => {
    router.push("/terms");
  };
  const handleWithdraw = () => {
    router.push("/withdraw");
  };

  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="text-[17px] font-bold text-fg-primary">계정 설정</h2>
      <div className="flex w-full flex-col gap-1 rounded-2xl bg-bg-subtle p-2">
        <Row
          icon={<UserCog className="size-4 text-fg-secondary" />}
          label="개인정보 수정"
          onClick={handleEditProfile}
        />
        <Row
          icon={<FileText className="size-4 text-fg-secondary" />}
          label="이용 약관"
          onClick={handleTerms}
        />
        <Row
          icon={<LogOut className="size-4 text-fg-secondary" />}
          label={signOut.isPending ? "로그아웃 중…" : "로그아웃"}
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
        />
        <Row
          icon={<UserX className="size-4 text-fg-warning" />}
          label="탈퇴"
          onClick={handleWithdraw}
          danger
        />
      </div>
    </section>
  );
}

function Row({ icon, label, onClick, disabled, danger }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "tap-spring flex w-full items-center gap-3.5 rounded-xl px-2 py-3 text-left transition-colors hover:bg-bg-elevated disabled:opacity-60",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-normal">
        {icon}
      </span>
      <span
        className={cn(
          "flex-1 truncate text-[15px] font-bold",
          danger ? "text-fg-warning" : "text-fg-secondary",
        )}
      >
        {label}
      </span>
      <ChevronRight
        className={cn(
          "size-4 shrink-0",
          danger ? "text-fg-warning" : "text-fg-tertiary",
        )}
      />
    </button>
  );
}
