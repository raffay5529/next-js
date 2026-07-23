import { getBoardsByUser } from "@/lib/actions/my-kanban-actions"
import BoardsPage from "./Boardspage"
import { getSession } from "@/lib/auth/auth"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import Image from "next/image"

function BoardsLoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2.5 mb-6">
        <Image
          src="/taska.png"
          alt="Taska Logo"
          width={32}
          height={32}
          className="w-8 h-8 object-contain rounded-xl"
          priority
        />
        <span className="text-slate-900 text-xl font-extrabold tracking-tight">Taska</span>
      </div>
      <Loader2 size={28} className="animate-spin text-blue-600" />
      <p className="text-slate-500 text-sm">Loading your boards…</p>
    </div>
  )
}

async function BoardContent() {
  const session = await getSession();
  console.log("Session data in BoardContent:", session);
  const result = await getBoardsByUser(session?.user.id ?? "");
  const boards = result.success ? result.data : [];

  return <BoardsPage user={session} boards={boards} />;
}

export default function Page() {
  return (
    <Suspense fallback={<BoardsLoadingFallback />}>
      <BoardContent />
    </Suspense>
  );
}