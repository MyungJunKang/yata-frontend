"use client";

import { useState } from "react";
import { Check, Clipboard } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMarkSettlementPaidMutation } from "@/features/rooms/api/use-settlement";
import type {
  PaymentAccount,
  Settlement,
} from "@/features/rooms/api/settlement.types";

function parsePayout(raw?: string | null): PaymentAccount | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") return obj as PaymentAccount;
  } catch {
    /* noop */
  }
  return null;
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

type Props = {
  roomId: string;
  settlement: Settlement;
  meId?: string | null;
  isHost?: boolean;
  className?: string;
};

export function SettlementNoticeCard({
  roomId,
  settlement,
  meId,
  isHost,
  className,
}: Props) {
  const total = settlement.totalFare ?? 0;
  const perPerson = settlement.perPersonAmount ?? 0;
  const members = settlement.members ?? [];
  const membersCount = settlement.membersCount ?? 0;
  const account = parsePayout(settlement.payout);
  const time = formatTime(settlement.createdAt);

  const myEntry = meId ? members.find((m) => m.userId === meId) : null;
  const myStatus = myEntry?.status ?? "unpaid";

  const markPaidMutation = useMarkSettlementPaidMutation(roomId);
  const [paidConfirmOpen, setPaidConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const markError =
    markPaidMutation.error instanceof ApiError
      ? markPaidMutation.error.message
      : markPaidMutation.error
        ? "처리에 실패했어요."
        : null;

  const handleCopyAccount = async () => {
    if (!account?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const handleConfirmPaid = () => {
    if (markPaidMutation.isPending) return;
    markPaidMutation.mutate(undefined, {
      onSuccess: () => setPaidConfirmOpen(false),
    });
  };

  const headerBadge = (() => {
    if (isHost) return null;
    if (myStatus === "confirmed")
      return { label: "정산 완료", tone: "success" as const };
    if (myStatus === "paid")
      return { label: "확인 대기 중", tone: "pending" as const };
    return null;
  })();

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[340px] flex-col gap-3 rounded-3xl border-[1.5px] border-stroke-point bg-bg-normal p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="size-7 shrink-0 rounded-full bg-point-400" />
        <p className="flex-1 truncate text-[13px] font-bold text-point-600">
          더치페이 공지
        </p>
        {headerBadge ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              headerBadge.tone === "pending"
                ? "bg-status-pending-bg text-status-pending-strong"
                : "bg-status-success-bg text-status-success-strong",
            )}
          >
            {headerBadge.label}
          </span>
        ) : (
          time && (
            <p className="text-[10px] font-bold text-fg-tertiary tabular">
              {time}
            </p>
          )
        )}
      </div>
      <p className="text-body-1 font-bold leading-snug text-fg-primary">
        택시비 정산 안내입니다 🚕
      </p>

      {settlement.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settlement.imageUrl}
          alt="영수증"
          className="max-h-[180px] w-full rounded-xl object-cover"
        />
      )}

      <div className="flex flex-col gap-1.5 rounded-xl bg-bg-subtle px-3.5 py-3">
        <Row label="총 금액" value={`₩${total.toLocaleString()}`} />
        <Row
          label="인원"
          value={`${membersCount || members.length || 0}명`}
        />
        <div className="my-0.5 h-px w-full bg-stroke-thin" />
        <Row label="1인 부담" value={`₩${perPerson.toLocaleString()}`} accent />
      </div>

      {account && (
        <div className="flex flex-col gap-1.5 rounded-xl bg-point-100 px-3.5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-point-600">
            입금 계좌
          </p>
          <p className="text-body-2 font-bold text-fg-primary">
            {account.bank} · {account.holder}
          </p>
          <p className="text-body-2 text-fg-secondary tabular tracking-wide">
            {account.accountNumber}
          </p>
          <button
            type="button"
            onClick={handleCopyAccount}
            className={cn(
              "tap-spring mt-1 inline-flex h-8 w-fit items-center gap-1.5 rounded-lg px-3 text-caption-1 font-bold transition-colors",
              copied
                ? "bg-status-success-bg text-status-success-strong"
                : "bg-bg-normal text-fg-point hover:bg-point-200",
            )}
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                복사됨
              </>
            ) : (
              <>
                <Clipboard className="size-3.5" />
                계좌번호 복사
              </>
            )}
          </button>
        </div>
      )}

      {/* 멤버 액션 — self mark paid */}
      {!isHost && myEntry && (
        <div className="flex flex-col gap-1.5">
          {myStatus === "unpaid" && (
            <>
              <Button
                variant="point"
                size="md"
                className="w-full"
                onClick={() => setPaidConfirmOpen(true)}
                disabled={markPaidMutation.isPending}
              >
                {markPaidMutation.isPending ? "처리 중…" : "송금 완료"}
              </Button>
              <p className="text-center text-caption-1 text-fg-tertiary">
                송금 후 &ldquo;송금 완료&rdquo; 버튼을 눌러주세요
              </p>
            </>
          )}
          {myStatus === "paid" && (
            <>
              <Button
                variant="point-soft"
                size="md"
                className="w-full"
                disabled
              >
                송금 완료됨
              </Button>
              <p className="text-center text-caption-1 text-fg-tertiary">
                호스트가 송금을 확인하면 정산이 마무리됩니다
              </p>
            </>
          )}
          {myStatus === "confirmed" && (
            <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-status-success-bg px-3.5 py-2.5 text-caption-1 font-bold text-status-success-strong">
              <Check className="size-3.5" />
              호스트가 송금 수령을 확인했어요
            </div>
          )}
          {markError && (
            <p
              role="alert"
              className="text-center text-caption-1 font-medium text-fg-warning"
            >
              {markError}
            </p>
          )}
        </div>
      )}

      {/* 호스트는 채팅 카드에서는 액션 없음 — /settlement 의 호스트 관리 화면에서 처리 */}
      {isHost && members.length > 0 && (
        <p className="text-center text-caption-1 text-fg-tertiary">
          {`확인 완료 ${members.filter((m) => m.status === "confirmed").length} / ${members.length}명`}
        </p>
      )}

      <ConfirmDialog
        open={paidConfirmOpen}
        title="송금을 완료하셨나요?"
        description={
          account
            ? `${account.bank} · ${account.holder} 계좌로 ₩${perPerson.toLocaleString()} 입금을 완료하셨다면 확인해 주세요.`
            : `₩${perPerson.toLocaleString()} 입금을 완료하셨다면 확인해 주세요.`
        }
        confirmLabel="송금 완료"
        cancelLabel="취소"
        pending={markPaidMutation.isPending}
        onConfirm={handleConfirmPaid}
        onCancel={() => {
          if (markPaidMutation.isPending) return;
          setPaidConfirmOpen(false);
        }}
      />
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-caption-1 font-bold text-fg-tertiary">{label}</span>
      <span
        className={cn(
          "tabular",
          accent
            ? "text-[16px] font-bold text-fg-point"
            : "text-[13px] font-medium text-fg-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}
