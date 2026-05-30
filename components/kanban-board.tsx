"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createContext, memo, useContext, useId, useMemo, useRef, useState, forwardRef, useEffect } from "react";
import { KanBan } from "@/lib/myModels/mymodels.types";
import { MoreVertical, Plus, Trash2, ArrowRightFromLine, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DialogTrigger, DialogContent, Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { changeCardColumn, createCard, createColumn, deleteCard, deleteColumn, saveOrder, updateCard, updateCardColumn, updateColumn } from "@/lib/actions/my-kanban-actions"

interface IColumn {
  _id: string
  name: string
  __v: number
  createdAt: string
  updatedAt: string
}

const ColumnsContext = createContext<IColumn[]>([]);
const useColumns = () => useContext(ColumnsContext);

export default function Ok({ columns, fetchedCardsFromDb, boardId }: {
  columns: IColumn[],
  fetchedCardsFromDb: KanBan[],
  boardId: string
}) {
  const id = useId();
  const [addColOpen, setAddColOpen] = useState(false)
  const [newColName, setNewColName] = useState("")
  const [tasks, setTasks] = useState<KanBan[]>(fetchedCardsFromDb);
  const [activeTask, setActiveTask] = useState<KanBan | null>(null);

  const tasksRef = useRef<KanBan[]>(fetchedCardsFromDb);
  const columnIdsRef = useRef<Set<string>>(new Set(columns.map(c => c._id)));
  const dragStartColumnRef = useRef<string | null>(null);

  // Sync state cleanly when Server Component revalidates and returns new data props
  useEffect(() => {
    setTasks(fetchedCardsFromDb);
    tasksRef.current = fetchedCardsFromDb;
  }, [fetchedCardsFromDb]);

  useEffect(() => {
    columnIdsRef.current = new Set(columns.map(c => c._id));
  }, [columns]);

  const stableColumns = useMemo(
    () => columns,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns.map(c => c._id).join(",")]
  );

  // Safe wrapper that supports both raw arrays and functional state updates
  const syncSetTasks = (updated: KanBan[] | ((prev: KanBan[]) => KanBan[])) => {
    if (typeof updated === "function") {
      setTasks((prev) => {
        const next = updated(prev);
        tasksRef.current = next;
        return next;
      });
    } else {
      tasksRef.current = updated;
      setTasks(updated);
    }
  };

  function handleDragStart(event: DragStartEvent) {
    const task = tasksRef.current.find(t => String(t._id) === event.active.id);
    setActiveTask(task ?? null);
    dragStartColumnRef.current = task?.column ?? null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const current = tasksRef.current;

    const dragged = current.find(t => String(t._id) === taskId);
    if (!dragged) return;

    const overIsColumn = columnIdsRef.current.has(overId);
    const overTask = current.find(t => String(t._id) === overId);
    const overColumn = overIsColumn ? overId : overTask?.column;

    if (!overColumn || dragged.column === overColumn) return;

    syncSetTasks(current.map(t =>
      String(t._id) === taskId ? { ...t, column: overColumn } : t
    ));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) {
      dragStartColumnRef.current = null;
      return;
    }

    const taskId = active.id as string;
    const overId = over.id as string;
    const current = tasksRef.current;

    const currentTask = current.find(t => String(t._id) === taskId);
    if (!currentTask) {
      dragStartColumnRef.current = null;
      return;
    }

    if (dragStartColumnRef.current && currentTask.column !== dragStartColumnRef.current) {
      updateCardColumn(taskId, currentTask.column, boardId);
    }
    dragStartColumnRef.current = null;

    const activeIndex = current.findIndex(t => String(t._id) === taskId);
    const overIndex = current.findIndex(t => String(t._id) === overId);

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      const reordered = arrayMove(current, activeIndex, overIndex);
      const withNewOrder = reordered.map((task, index) => ({ ...task, order: index }));
      syncSetTasks(withNewOrder);
      saveOrder(withNewOrder, boardId);
    }
  }

  return (
    <ColumnsContext.Provider value={stableColumns}>
      <div className="min-h-screen mx-auto w-full flex justify-center items-center">
        <div className="flex mx-10 flex-1 justify-between">
          <DndContext id={id} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            {columns.map((col) => (
              <Column key={col._id} col={col} tasks={tasks} setTasks={syncSetTasks} boardId={boardId} />
            ))}

            <Dialog open={addColOpen} onOpenChange={setAddColOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-32 self-center cursor-pointer border-2 border-gray-400 px-6">
                  <Plus size={16} />
                  Add Column
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Add Column</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Column name</label>
                    <input
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value)}
                      className="border rounded px-3 py-2 text-sm"
                      placeholder="e.g. In Review"
                    />
                  </div>
                  <Button className="cursor-pointer" onClick={async () => {
                    if (!newColName.trim()) return
                    await createColumn(newColName, boardId)
                    setNewColName("")
                    setAddColOpen(false)
                  }}>
                    Create Column
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <DragOverlay>
              {activeTask ? (
                <TaskCardUI data={activeTask} boardId={boardId} />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </ColumnsContext.Provider>
  );
}

interface ColumnProps {
  col: IColumn;
  tasks: KanBan[];
  setTasks: (tasks: KanBan[] | ((prev: KanBan[]) => KanBan[])) => void;
  boardId: string;
}

const Column = memo(function Column({ col, tasks, setTasks, boardId }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: col._id });

  const colTasks = useMemo(
    () => tasks.filter(t => t.column === col._id),
    [tasks, col._id]
  );

  const sortableIds = useMemo(
    () => colTasks.map(t => String(t._id)),
    [colTasks]
  );

  const [editColOpen, setEditColOpen] = useState(false)
  const [editColName, setEditColName] = useState(col.name)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<KanBan>({
    title: "", description: "", tag: "", assignee: "", initials: "", column: ""
  });

  return (
    <div>
      <div className="group/col flex items-center justify-center gap-2 border-b pb-2 mb-2">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 text-center">
          {col.name}
        </h2>
        <div className="opacity-0 group-hover/col:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-gray-100 cursor-pointer">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setEditColOpen(true)}>
                <Pencil className="mr-2 w-4 h-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await deleteColumn(col._id, boardId)
              }}>
                <Trash2 className="mr-2 w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div ref={setNodeRef} className="flex flex-col gap-4 border border-gray-500 px-4 py-4 rounded-lg">
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {colTasks.map((data) => (
            <TaskCard
              key={String(data._id)}
              data={data}
              setOpen={setOpen}
              setFormData={setFormData}
              setTasks={setTasks}
              boardId={boardId}
            />
          ))}
        </SortableContext>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({
              title: "", description: "", tag: "", assignee: "", initials: "", column: ""
            })} className="cursor-pointer">
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Enter Card Details</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Title</label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="border rounded px-3 py-2 text-sm resize-none" rows={3} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Tag</label>
                <input value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Assignee</label>
                <input value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Column</label>
                <input defaultValue={col.name} readOnly className="border rounded px-3 py-2 text-sm" />
              </div>
              <Button className="cursor-pointer" onClick={async () => {
                if (!formData.title || !formData.tag) { alert("Please fill all fields"); return }
                if (formData._id) {
                  await updateCard(formData._id, formData, boardId)
                  setOpen(false)
                  return
                }
                await createCard({ ...formData, column: col._id }, boardId)
                setOpen(false)
              }}>Submit Card</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editColOpen} onOpenChange={setEditColOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Edit Column</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Column name</label>
              <input value={editColName} onChange={(e) => setEditColName(e.target.value)} className="border rounded px-3 py-2 text-sm" />
            </div>
            <Button className="cursor-pointer" onClick={async () => {
              await updateColumn(col._id, editColName, boardId)
              setEditColOpen(false)
            }}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

interface TaskCardProps {
  data: KanBan;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFormData: React.Dispatch<React.SetStateAction<KanBan>>;
  setTasks: (tasks: KanBan[] | ((prev: KanBan[]) => KanBan[])) => void;
  boardId: string;
}

const TaskCardUI = forwardRef<HTMLDivElement, {
  data: KanBan;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setFormData?: React.Dispatch<React.SetStateAction<KanBan>>;
  setTasks?: (tasks: KanBan[] | ((prev: KanBan[]) => KanBan[])) => void;
  boardId: string;
  style?: React.CSSProperties;
  attributes?: any;
  listeners?: any;
}>(({ data, setOpen, setFormData, setTasks, boardId, style, attributes, listeners }, ref) => {
  const columns = useColumns();
  const result = columns.filter(c => c._id !== data.column);

  return (
    <Card ref={ref} {...listeners} {...attributes} style={style} className="w-80 border border-gray-200 shadow">
      <CardHeader className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger className="absolute top-0 right-2" onPointerDown={(e) => e.stopPropagation()}>
            <MoreVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent onPointerDown={(e) => e.stopPropagation()}>
            {setFormData && setOpen && (
              <DropdownMenuItem onClick={() => { setFormData(data); setOpen(true) }}>
                <Pencil className="mr-2 w-4 h-4" />
                Edit
              </DropdownMenuItem>
            )}
            {setTasks && (
              <DropdownMenuItem onClick={() => {
                deleteCard(data._id!, boardId)
                setTasks(prev => prev.filter(t => String(t._id) !== String(data._id)))
              }}>
                <Trash2 className="mr-2 w-4 h-4" />
                Delete
              </DropdownMenuItem>
            )}
            {setTasks && result.map((c, index) => (
              <DropdownMenuItem key={index} onClick={async () => {
                await changeCardColumn(String(data._id), c._id, boardId);
                setTasks(prev => prev.map(t =>
                  String(t._id) === String(data._id) ? { ...t, column: c._id } : t
                ))
              }}>
                <ArrowRightFromLine className="mr-2 w-4 h-4" />
                Move To {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CardTitle>{data.title}</CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{data.assignee}</p>
        {data.tag && data.tag.length > 0 && data.tag.split(",").map((t, index) => (
          <span key={index} className="ml-2 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800">
            {t.trim()}
          </span>
        ))}
      </CardContent>
    </Card>
  );
});
TaskCardUI.displayName = "TaskCardUI";

function TaskCard({ data, setOpen, setFormData, setTasks, boardId }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(data._id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <TaskCardUI
      ref={setNodeRef}
      data={data}
      setOpen={setOpen}
      setFormData={setFormData}
      setTasks={setTasks}
      boardId={boardId}
      style={style}
      attributes={attributes}
      listeners={listeners}
    />
  );
}