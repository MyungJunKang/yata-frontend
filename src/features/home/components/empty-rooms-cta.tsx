import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

export function EmptyRoomsCta() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-stroke-normal bg-transparent px-6 py-7 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-point-50 text-fg-point">
        <Sparkles className="size-5" />
      </span>
      <p className="text-subtitle text-fg-primary">맞는 시간이 없으신가요?</p>
      <p className="text-body-2 leading-[1.6] text-fg-secondary">
        직접 방을 만들고 다른
        <br />
        숭실대 학생들의 참여를 기다려 보세요.
      </p>
      <Link
        href="/create-room"
        className="mt-2 inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-point-500 px-5 text-strong-2 text-fg-inverse transition-colors hover:bg-point-600"
      >
        <Plus className="size-4" strokeWidth={2.5} />내 방 만들기
      </Link>
    </div>
  );
}
