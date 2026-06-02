"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ImagePlus, X } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { YataLogo } from "@/components/ui/yata-logo";
import { useActiveRoomQuery, useUserQuery } from "@/features/user/api/use-user";
import {
  useConfirmSettlementPaymentMutation,
  useCreateSettlementMutation,
  useSettlementQuery,
} from "@/features/rooms/api/use-settlement";
import { useArchiveRoomMutation } from "@/features/rooms/api/use-room-actions";
import { formatDepartAt } from "@/features/rooms/lib/format";
import type {
  PaymentAccount,
  Settlement,
  SettlementMember,
} from "@/features/rooms/api/settlement.types";

type Props = {
  roomId: string;
};

export function SettlementScreen({ roomId }: Props) {
  const router = useRouter();
  const userQuery = useUserQuery();
  const activeRoomQuery = useActiveRoomQuery();
  const settlementQuery = useSettlementQuery(roomId);
  const createMutation = useCreateSettlementMutation(roomId);

  const room = activeRoomQuery.data?.room ?? null;
  const me = userQuery.data;
  const isHost = !!(me && room && room.members.some(
    (m) => m.userId === me.id && m.role === "host",
  ));
  const capacity = room?.joinedCount ?? 0;

  const [fareInput, setFareInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalFare = useMemo(() => {
    const n = Number(fareInput.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }, [fareInput]);
  const perPersonFare = useMemo(() => {
    if (!totalFare || capacity <= 0) return 0;
    return Math.ceil(totalFare / capacity / 100) * 100;
  }, [totalFare, capacity]);
  const imagePreviewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );

  const submitError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? "정산 게시에 실패했어요."
        : null;

  if (settlementQuery.data) {
    return (
      <SettlementView
        roomId={roomId}
        onBack={() => router.back()}
        settlement={settlementQuery.data}
        isHost={isHost}
      />
    );
  }

  if (room && me && !isHost) {
    return (
      <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
        <AppBar onBack={() => router.back()} title="정산하기" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-strong-1 text-fg-primary">
            아직 정산 공지가 없어요.
          </p>
          <p className="text-body-2 text-fg-secondary">
            호스트가 택시비를 입력하고 정산을 시작할 때까지 기다려 주세요.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!totalFare || capacity <= 0 || createMutation.isPending) return;
    createMutation.mutate(
      {
        totalFare,
        perPersonAmount: perPersonFare,
        membersCount: capacity,
        image: imageFile ?? undefined,
      },
      {
        onSuccess: () => router.push(`/room/${roomId}`),
      },
    );
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
      <AppBar onBack={() => router.back()} title="정산하기" />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <h1 className="text-[24px] font-bold leading-tight tracking-tight text-fg-primary">
          택시비를 입력해 주세요
        </h1>

        <section className="flex flex-col gap-3 rounded-2xl bg-bg-normal p-[18px] shadow-sm">
          <p className="text-[13px] font-bold text-fg-secondary">
            실제 결제한 택시 요금
          </p>
          <label className="flex h-[60px] items-baseline justify-between gap-2 rounded-xl bg-bg-subtle px-[18px] py-3">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={fareInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setFareInput(raw ? Number(raw).toLocaleString() : "");
              }}
              placeholder="13,000"
              className="size-full bg-transparent text-[32px] font-bold tracking-tight text-fg-primary placeholder:text-fg-tertiary/60 focus:outline-none tabular"
              aria-label="실제 결제한 택시 요금"
            />
            <span className="shrink-0 text-base text-fg-tertiary">원</span>
          </label>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl bg-bg-normal p-[18px] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold text-fg-secondary">
              영수증 이미지 <span className="text-fg-tertiary">(선택)</span>
            </p>
            {imageFile && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="inline-flex items-center gap-1 rounded-full bg-bg-subtle px-2.5 py-1 text-caption-1 font-bold text-fg-tertiary hover:text-fg-warning"
              >
                <X className="size-3" /> 삭제
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImagePick}
            className="hidden"
            aria-label="영수증 이미지 선택"
          />
          {imagePreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreviewUrl}
              alt="영수증 미리보기"
              className="max-h-[200px] w-full rounded-xl object-cover"
            />
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="tap-spring flex h-24 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stroke-normal bg-bg-subtle text-fg-tertiary hover:border-stroke-point hover:text-fg-point"
            >
              <ImagePlus className="size-5" />
              <span className="text-body-2 font-bold">이미지 첨부하기</span>
            </button>
          )}
        </section>

        <section className="flex flex-col gap-2.5 rounded-2xl bg-point-100 p-[18px]">
          <header className="flex items-center justify-between">
            <p className="text-caption-1 font-bold text-fg-secondary">
              내 정산 계좌
            </p>
            <button
              type="button"
              onClick={() => router.push("/mypage")}
              className="text-caption-1 font-bold text-fg-point"
            >
              프로필에서 변경 ›
            </button>
          </header>
          <p className="text-[17px] font-bold text-fg-primary">
            계좌 미등록
          </p>
          <p className="text-[15px] tracking-wide text-fg-tertiary">
            프로필 → 개인정보 수정에서 추가해 주세요.
          </p>
        </section>

        <p className="text-caption-1 font-bold text-fg-secondary">
          채팅방 미리보기
        </p>

        <section className="flex flex-col gap-3 rounded-3xl border-[1.5px] border-stroke-point bg-bg-normal p-[18px]">
          <div className="flex items-center gap-2">
            <span className="size-7 shrink-0 rounded-full bg-point-400" />
            <p className="flex-1 truncate text-[13px] font-bold text-point-600">
              더치페이 공지
            </p>
            <p className="text-[10px] font-bold text-fg-tertiary">미리보기</p>
          </div>
          <p className="text-body-1 font-bold leading-snug text-fg-primary">
            택시비 정산 안내입니다 🚕
          </p>
          <div className="flex flex-col gap-1.5 rounded-xl bg-bg-subtle px-3.5 py-3">
            <PreviewRow
              label="총 금액"
              value={totalFare ? `₩${totalFare.toLocaleString()}` : "—"}
            />
            <PreviewRow label="인원" value={`${capacity}명`} />
            <div className="my-0.5 h-px w-full bg-stroke-thin" />
            <PreviewRow
              label="1인 부담"
              value={perPersonFare ? `₩${perPersonFare.toLocaleString()}` : "—"}
              accent
            />
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-point-100 px-3.5 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-point-600">
              입금 계좌
            </p>
            <p className="text-body-2 font-bold text-fg-primary">
              {me?.name ?? "—"}
            </p>
            <p className="text-body-2 text-fg-tertiary">계좌 미등록</p>
          </div>
        </section>

        {room && (
          <p className="px-1 text-caption-1 text-fg-tertiary">
            방: {room.startPoint} → {room.endPoint} ·{" "}
            {formatDepartAt(room.departAt)}
          </p>
        )}

        {submitError && (
          <p
            role="alert"
            className="rounded-sm bg-red-100 px-3 py-2 text-caption-1 font-medium text-fg-warning"
          >
            {submitError}
          </p>
        )}
      </div>

      <div className="flex w-full flex-col items-center bg-bg-normal px-6 pb-7 pt-4">
        <Button
          variant="point"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={!totalFare || createMutation.isPending || !isHost}
        >
          {createMutation.isPending
            ? "공지 게시 중…"
            : isHost
              ? "채팅방에 공지 게시"
              : "호스트만 정산을 시작할 수 있어요"}
        </Button>
      </div>
    </div>
  );
}

function AppBar({
  onBack,
  title,
}: {
  onBack: () => void;
  title: string;
}) {
  return (
    <div className="flex h-14 w-full items-center justify-between border-b border-stroke-thin bg-bg-normal px-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex size-11 items-center justify-center text-fg-primary"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-[17px] font-bold text-fg-primary">{title}</p>
      </div>
      <YataLogo />
    </div>
  );
}

function PreviewRow({
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

function formatStatusTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const STATUS_META: Record<
  SettlementMember["status"],
  { label: string; tone: "muted" | "pending" | "success" }
> = {
  unpaid: { label: "미송금", tone: "muted" },
  paid: { label: "송금 확인 필요", tone: "pending" },
  confirmed: { label: "수령 확인됨", tone: "success" },
};

function SettlementView({
  roomId,
  onBack,
  settlement,
  isHost,
}: {
  roomId: string;
  onBack: () => void;
  settlement: Settlement;
  isHost: boolean;
}) {
  const router = useRouter();
  const total = settlement.totalFare ?? 0;
  const perPerson = settlement.perPersonAmount ?? 0;
  const members = settlement.members ?? [];
  const account = parsePayout(settlement.payout);
  const confirmedCount = members.filter((m) => m.status === "confirmed").length;
  const receivedTotal = confirmedCount * perPerson;
  const allConfirmed =
    members.length > 0 && confirmedCount === members.length;

  const confirmMutation = useConfirmSettlementPaymentMutation(roomId);
  const archiveMutation = useArchiveRoomMutation();
  const [pendingMember, setPendingMember] = useState<SettlementMember | null>(
    null,
  );
  const [archiveOpen, setArchiveOpen] = useState(false);

  const confirmError =
    confirmMutation.error instanceof ApiError
      ? confirmMutation.error.message
      : confirmMutation.error
        ? "처리에 실패했어요."
        : null;
  const archiveError =
    archiveMutation.error instanceof ApiError
      ? archiveMutation.error.message
      : archiveMutation.error
        ? "방 종료에 실패했어요."
        : null;

  if (!isHost) {
    return (
      <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
        <AppBar onBack={onBack} title="정산 공지" />
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <h1 className="text-[24px] font-bold leading-tight tracking-tight text-fg-primary">
            정산 공지
          </h1>
          {settlement.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settlement.imageUrl}
              alt="영수증"
              className="max-h-[260px] w-full rounded-2xl object-cover shadow-sm"
            />
          )}
          <section className="flex flex-col gap-3 rounded-2xl bg-bg-normal p-[18px] shadow-sm">
            <PreviewRow label="총 금액" value={`₩${total.toLocaleString()}`} />
            <PreviewRow
              label="인원"
              value={`${settlement.membersCount ?? 0}명`}
            />
            <div className="h-px w-full bg-stroke-thin" />
            <PreviewRow
              label="1인 부담"
              value={`₩${perPerson.toLocaleString()}`}
              accent
            />
          </section>
          {account && (
            <section className="flex flex-col gap-1 rounded-2xl bg-point-100 p-[18px]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-point-600">
                입금 계좌
              </p>
              <p className="text-body-1 font-bold text-fg-primary">
                {account.bank} · {account.holder}
              </p>
              <p className="text-body-1 text-fg-secondary tracking-wide tabular">
                {account.accountNumber}
              </p>
            </section>
          )}
        </div>
      </div>
    );
  }

  const handleConfirmClick = (m: SettlementMember) => {
    if (confirmMutation.isPending) return;
    setPendingMember(m);
  };

  const handleApprove = () => {
    if (!pendingMember || confirmMutation.isPending) return;
    confirmMutation.mutate(pendingMember.userId, {
      onSuccess: () => setPendingMember(null),
    });
  };

  const handleArchive = () => {
    if (archiveMutation.isPending) return;
    archiveMutation.mutate(roomId, {
      onSuccess: () => {
        setArchiveOpen(false);
        router.replace("/home");
      },
    });
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
      <AppBar onBack={onBack} title="정산 현황" />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pb-4">
        <header
          className={cn(
            "flex flex-col gap-1.5 rounded-2xl p-[18px]",
            allConfirmed ? "bg-status-success-bg" : "bg-point-100",
          )}
        >
          <span
            className={cn(
              "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-fg-inverse",
              allConfirmed ? "bg-status-success-strong" : "bg-point-500",
            )}
          >
            {allConfirmed ? "정산 완료" : "호스트 전용"}
          </span>
          <p className="text-strong-1 text-fg-primary">
            {allConfirmed
              ? "모든 송금이 확인됐어요. 방을 종료해 주세요."
              : "멤버 송금을 확인하고 처리하세요"}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-2xl bg-bg-normal p-[18px] shadow-sm">
            <p className="text-caption-1 font-bold text-fg-tertiary">진행률</p>
            <p className="text-[20px] font-bold text-fg-primary tabular">
              {confirmedCount} / {members.length}명
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-bg-normal p-[18px] shadow-sm">
            <p className="text-caption-1 font-bold text-fg-tertiary">
              총 받을 금액
            </p>
            <p className="text-[20px] font-bold text-fg-point tabular">
              ₩{receivedTotal.toLocaleString()}
            </p>
          </div>
        </section>

        {settlement.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settlement.imageUrl}
            alt="영수증"
            className="max-h-[200px] w-full rounded-2xl object-cover shadow-sm"
          />
        )}

        <section className="flex flex-col gap-2 rounded-2xl bg-bg-normal p-[18px] shadow-sm">
          <p className="text-caption-1 font-bold text-fg-secondary">
            멤버 정산 상태
          </p>
          <ul className="flex flex-col">
            {members.map((m) => (
              <MemberRow
                key={m.userId}
                member={m}
                onConfirmClick={() => handleConfirmClick(m)}
                disabled={
                  confirmMutation.isPending &&
                  confirmMutation.variables === m.userId
                }
              />
            ))}
            {members.length === 0 && (
              <li className="py-4 text-center text-caption-1 text-fg-tertiary">
                멤버 정보가 없어요.
              </li>
            )}
          </ul>
          {confirmError && (
            <p
              role="alert"
              className="text-caption-1 font-medium text-fg-warning"
            >
              {confirmError}
            </p>
          )}
        </section>

        <p className="px-1 text-caption-1 text-fg-tertiary">
          총 금액 ₩{total.toLocaleString()} · 1인 ₩{perPerson.toLocaleString()}
        </p>

        {archiveError && (
          <p
            role="alert"
            className="rounded-lg bg-red-100 px-3 py-2 text-caption-1 font-medium text-fg-warning"
          >
            {archiveError}
          </p>
        )}
      </div>

      {allConfirmed && (
        <div className="flex w-full flex-col items-center gap-1 border-t border-stroke-thin bg-bg-normal px-6 pb-7 pt-4">
          <Button
            variant="point"
            size="lg"
            className="w-full"
            onClick={() => setArchiveOpen(true)}
            disabled={archiveMutation.isPending}
          >
            <Check className="size-4" />
            {archiveMutation.isPending ? "종료 중…" : "정산 완료 · 방 종료하기"}
          </Button>
          <p className="text-center text-caption-1 text-fg-tertiary">
            종료하면 모든 멤버가 함께 방에서 나가게 돼요
          </p>
        </div>
      )}

      <ConfirmDialog
        open={archiveOpen}
        title="방을 종료할까요?"
        description="정산이 모두 완료됐어요. 종료하면 모든 멤버가 함께 나가게 되며 채팅도 종료됩니다."
        confirmLabel="방 종료"
        cancelLabel="취소"
        variant="danger"
        pending={archiveMutation.isPending}
        onConfirm={handleArchive}
        onCancel={() => {
          if (archiveMutation.isPending) return;
          setArchiveOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!pendingMember}
        title="수령을 확인할까요?"
        description={
          pendingMember
            ? `${pendingMember.name} 님의 ₩${perPerson.toLocaleString()} 송금을 수령했음을 확인합니다. 확인 후에는 정산이 마무리 처리돼요.`
            : ""
        }
        confirmLabel="수령 확인"
        cancelLabel="취소"
        pending={confirmMutation.isPending}
        onConfirm={handleApprove}
        onCancel={() => {
          if (confirmMutation.isPending) return;
          setPendingMember(null);
        }}
      />

      {/* roomId placeholder for future actions */}
      <div className="hidden">{roomId}</div>
    </div>
  );
}

function MemberRow({
  member,
  onConfirmClick,
  disabled,
}: {
  member: SettlementMember;
  onConfirmClick: () => void;
  disabled?: boolean;
}) {
  const meta = STATUS_META[member.status];
  const time =
    member.status === "confirmed"
      ? formatStatusTime(member.confirmedAt)
      : member.status === "paid"
        ? formatStatusTime(member.paidAt)
        : "";

  return (
    <li className="flex items-center gap-3 border-b border-stroke-thin py-3 last:border-b-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-caption-1 font-bold text-fg-secondary">
        {member.name.slice(0, 1)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-body-2 font-bold text-fg-primary">
          {member.name}
        </p>
        <p className="flex items-center gap-1 truncate text-caption-1 text-fg-tertiary">
          <StatusLabel tone={meta.tone}>{meta.label}</StatusLabel>
          {time && (
            <>
              <span className="text-stroke-normal">·</span>
              <span className="tabular">{time}</span>
            </>
          )}
        </p>
      </div>
      {member.status === "paid" && (
        <Button
          variant="point"
          size="sm"
          onClick={onConfirmClick}
          disabled={disabled}
        >
          {disabled ? "처리 중…" : "수령 확인"}
        </Button>
      )}
      {member.status === "confirmed" && (
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-status-success-bg text-status-success-strong">
          <Check className="size-4" />
        </span>
      )}
    </li>
  );
}

function StatusLabel({
  tone,
  children,
}: {
  tone: "muted" | "pending" | "success";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "font-bold",
        tone === "muted" && "text-fg-tertiary",
        tone === "pending" && "text-status-pending-strong",
        tone === "success" && "text-status-success-strong",
      )}
    >
      {children}
    </span>
  );
}
