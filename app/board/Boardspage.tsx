"use client"
import { useState } from "react"
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { createBoard, deleteBoard, updateBoard } from "@/lib/actions/my-kanban-actions"
import { useRouter } from "next/navigation"
import type { getSession } from "@/lib/auth/auth"

type Session = Awaited<ReturnType<typeof getSession>>

interface Board {
  _id: string
  name: string
  columns: string[]
  createdAt: string
  updatedAt: string
}

interface Props {
  boards: Board[]
  user: Session
}

const BOARD_COLORS = [
  "#7F77DD", "#1D9E75", "#D85A30",
  "#378ADD", "#D4537E", "#BA7517"
]

export default function BoardsPage({ boards, user }: Props) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [boardName, setBoardName] = useState("")
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [editOpen, setEditOpen] = useState(false)
  const [editBoard, setEditBoard] = useState<Board | null>(null)
  const [editName, setEditName] = useState("")

  async function handleCreate() {
    if (!boardName.trim()) return

    setLoading(true)
    setError("")

    const result = await createBoard({ name: boardName, userId: user?.user.id ?? "Null User DB issue" })

    if (result.success) {
      setBoardName("")
      setSelectedColor(BOARD_COLORS[0])
      setOpen(false)
    } else {
      setError(result.error || "Something went wrong.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-semibold mb-8">My boards</h1>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">

        {boards.length === 0 && (
          <p className="text-gray-400 text-sm col-span-full">No boards yet. Create one!</p>
        )}

        {boards.map((board, index) => (
          <div
            key={board._id}
            onClick={() => router.push(`/b/${board._id}`)}
            className="relative rounded-xl p-5 cursor-pointer transition-all min-h-[120px] flex flex-col justify-between group hover:brightness-110"
            style={{ background: BOARD_COLORS[index % BOARD_COLORS.length] }}
          >
            {/* dark overlay so text doesn't blend */}
            <div className="absolute inset-0 rounded-xl bg-black/20 pointer-events-none" />

            <div
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded hover:bg-white/20">
                    <MoreVertical size={16} className="text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => {
                    setEditBoard(board)
                    setEditName(board.name)
                    setEditOpen(true)
                  }}>
                    <Pencil className="mr-2 w-4 h-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => {
                    await deleteBoard(board._id)
                  }}>
                    <Trash2 className="mr-2 w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="relative z-10">
              {/* empty top so content stays at bottom */}
            </div>

            <div className="relative z-10">
              <p className="font-medium text-white">{board.name}</p>
              <p className="text-sm text-white/70 mt-1">
                {board.columns.length} columns
              </p>
            </div>
          </div>
        ))}

        {/* create board dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div className="border border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-gray-500 transition-colors min-h-[120px] flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600">
              <Plus size={24} />
              <span className="text-sm">New board</span>
            </div>
          </DialogTrigger>

          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Create a new board</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Board name</label>
                <input
                maxLength={50}
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="e.g. Sprint 15"
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  {BOARD_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                      style={{
                        background: color,
                        outline: selectedColor === color ? `2px solid ${color}` : "none",
                        outlineOffset: "2px"
                      }}
                    />
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button onClick={handleCreate} disabled={loading} className="cursor-pointer mt-2">
                {loading ? "Creating..." : "Create board"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* edit board dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Edit board</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Board name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
              <Button onClick={async () => {
                await updateBoard(editBoard!._id, editName)
                setEditOpen(false)
              }} className="cursor-pointer">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}