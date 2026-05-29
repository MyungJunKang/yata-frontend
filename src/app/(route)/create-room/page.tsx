import Link from "next/link";

export default function CreateRoomPage() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-3 px-4">
      <h1 className="text-title-2 text-fg-primary">방 만들기</h1>
      <p className="text-body-2 text-fg-secondary">곧 만나요. 준비 중이에요.</p>
      <Link
        href="/home"
        className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-point-500 px-6 text-strong-2 text-fg-inverse hover:bg-point-600"
      >
        홈으로
      </Link>
    </div>
  );
}
