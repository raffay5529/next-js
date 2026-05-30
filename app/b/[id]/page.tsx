import MyKanBan from "../MyKanBan"
import { getCards, getColumns } from "@/lib/actions/my-kanban-actions"
import { IColumn } from "@/lib/models/column"
import { Suspense } from "react"

async function KanBanContent({ id }: { id: string }) {
  const fetchedColumnsFromDb = await getColumns(id)
  const fetchedCardsFromDb = await getCards(fetchedColumnsFromDb.map((c: IColumn) => c._id))

  return (
    <MyKanBan
      columns={fetchedColumnsFromDb}
      fetchedCardsFromDb={fetchedCardsFromDb}
      boardId={id}
    />
  )
}

async function ParamsResolver({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KanBanContent id={id} />
}

export default function KanBan({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParamsResolver params={params} />
    </Suspense>
  )
}