import { AuthAppBar } from "@/features/auth/components/auth-app-bar";
import { CreateRoomForm } from "@/features/rooms/components/create-room-form";

export default function CreateRoomPage() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-bg-page pb-2">
      <div className="px-5">
        <AuthAppBar backHref="/home" title="방 만들기" />
      </div>
      <div className="h-2 w-full" />
      <CreateRoomForm />
    </div>
  );
}
