import MyKanBan from "../MyKanBan"
import { getCards, getColumns } from "@/lib/actions/my-kanban-actions"
import { IColumn } from "@/lib/models/column"
import { Suspense } from "react"
import { Loader2, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function KanBanLoadingFallback() {
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
      <p className="text-slate-500 text-sm">Loading your board…</p>
    </div>
  )
}

async function KanBanContent({ id }: { id: string }) {
  const fetchedColumnsFromDb = await getColumns(id)
  const fetchedCardsFromDb = await getCards(fetchedColumnsFromDb.map((c: IColumn) => c._id))

  return (
    <div>
      <div className="px-4 pt-4">
        <Link
          href="/board"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to boards
        </Link>
      </div>
      <MyKanBan
        columns={fetchedColumnsFromDb}
        fetchedCardsFromDb={fetchedCardsFromDb}
        boardId={id}
      />
    </div>
  )
}

async function ParamsResolver({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KanBanContent id={id} />
}

export default function KanBan({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<KanBanLoadingFallback />}>
      <ParamsResolver params={params} />
    </Suspense>
  )
}