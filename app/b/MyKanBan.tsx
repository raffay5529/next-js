"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createContext, memo, useContext, useId, useMemo, useRef, useState, forwardRef, useEffect, CSSProperties, Dispatch, SetStateAction, ReactNode } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { KanBan } from "@/lib/myModels/mymodels.types";
import { MoreVertical, Plus, Trash2, ArrowRightFromLine, Pencil, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DialogTrigger, DialogContent, Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { changeCardColumn, createCard, createColumn, deleteCard, deleteColumn, saveOrder, updateCard, updateCardColumn, updateColumn } from "@/lib/actions/my-kanban-actions"

// ─── Types ────────────────────────────────────────────────────────────────────

interface IColumn {
  _id: string
  name: string
  __v: number
  createdAt: string
  updatedAt: string
}

interface BoardProps {
  columns: IColumn[]
  fetchedCardsFromDb: KanBan[]
  boardId: string
}

interface ColumnProps {
  col: IColumn
  tasks: KanBan[]
  setTasks: (tasks: KanBan[] | ((prev: KanBan[]) => KanBan[])) => void
  boardId: string
}

interface TaskCardProps {
  data: KanBan
  setOpen: Dispatch<SetStateAction<boolean>>
  setFormData: Dispatch<SetStateAction<KanBan>>
  setTasks: (tasks: KanBan[] | ((prev: KanBan[]) => KanBan[])) => void
  boardId: string
}

interface TaskCardUIProps {
  data: KanBan
  setOpen?: Dispatch<SetStateAction<boolean>>
  setFormData?: Dispatch<SetStateAction<KanBan>>
  setTasks?: (tasks: KanBan[] | ((prev: KanBan[]) => KanBan[])) => void
  boardId: string
  style?: CSSProperties
  attributes?: DraggableAttributes
  listeners?: SyntheticListenerMap
}

interface AddColumnDialogProps {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  boardId: string
}

interface EditColumnDialogProps {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  colId: string
  colName: string
  boardId: string
}

interface CardDialogProps {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  formData: KanBan
  setFormData: Dispatch<SetStateAction<KanBan>>
  colId: string
  colName: string
  boardId: string
}

interface FormFieldProps {
  label: string
  children: ReactNode
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ColumnsContext = createContext<IColumn[]>([]);
const useColumns = () => useContext(ColumnsContext);

// ─── Tag color palette ────────────────────────────────────────────────────────

const TAG_COLORS: Record<number, string> = {
  0: "bg-blue-50 text-blue-700 border border-blue-200",
  1: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  2: "bg-amber-50 text-amber-700 border border-amber-200",
  3: "bg-rose-50 text-rose-700 border border-rose-200",
  4: "bg-violet-50 text-violet-700 border border-violet-200",
};

const AVATAR_COLORS: string[] = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function getAvatarColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── FormField ────────────────────────────────────────────────────────────────

function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Shared input / textarea styles ───────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

// ─── AddColumnDialog ──────────────────────────────────────────────────────────

function AddColumnDialog({ open, onOpenChange, boardId }: AddColumnDialogProps) {
  const [newColName, setNewColName] = useState<string>("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="bg-white border border-slate-300 shadow-2xl rounded-2xl max-w-sm w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 tracking-tight">
            New Column
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <FormField label="Column Name">
            <input
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className={inputCls}
              placeholder="e.g. In Review"
              autoFocus
            />
          </FormField>
          <Button
            className="cursor-pointer h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
            onClick={async () => {
              if (!newColName.trim()) return;
              await createColumn(newColName, boardId);
              setNewColName("");
              onOpenChange(false);
            }}
          >
            Create Column
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── EditColumnDialog ─────────────────────────────────────────────────────────

function EditColumnDialog({ open, onOpenChange, colId, colName, boardId }: EditColumnDialogProps) {
  const [editColName, setEditColName] = useState<string>(colName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="bg-white border border-slate-300 shadow-2xl rounded-2xl max-w-sm w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 tracking-tight">
            Rename Column
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <FormField label="Column Name">
            <input
              value={editColName}
              onChange={(e) => setEditColName(e.target.value)}
              className={inputCls}
            />
          </FormField>
          <Button
            className="cursor-pointer h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
            onClick={async () => {
              await updateColumn(colId, editColName, boardId);
              onOpenChange(false);
            }}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── CardDialog ───────────────────────────────────────────────────────────────

function CardDialog({ open, onOpenChange, formData, setFormData, colId, colName, boardId }: CardDialogProps) {
  const isEditing = Boolean(formData._id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="bg-white border border-slate-300 shadow-2xl rounded-2xl max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 tracking-tight">
            {isEditing ? "Edit Card" : "New Card"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <FormField label="Title">
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputCls}
              placeholder="Card title"
            />
          </FormField>
          <FormField label="Description">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Brief description…"
            />
          </FormField>
          <FormField label="Tags">
            <input
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              className={inputCls}
              placeholder="e.g. bug, feature (comma-separated)"
            />
          </FormField>
          <FormField label="Assignee">
            <input
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className={inputCls}
              placeholder="Team member name"
            />
          </FormField>
          <FormField label="Column">
            <input
              defaultValue={colName}
              readOnly
              className={`${inputCls} bg-slate-200 text-slate-500 cursor-not-allowed`}
            />
          </FormField>
          <Button
            className="cursor-pointer h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition mt-1"
            onClick={async () => {
              if (!formData.title || !formData.tag) { alert("Please fill all required fields"); return; }
              if (formData._id) {
                await updateCard(formData._id, formData, boardId);
                onOpenChange(false);
                return;
              }
              await createCard({ ...formData, column: colId }, boardId);
              onOpenChange(false);
            }}
          >
            {isEditing ? "Save Changes" : "Create Card"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── TaskCardUI ───────────────────────────────────────────────────────────────

const TaskCardUI = forwardRef<HTMLDivElement, TaskCardUIProps>(
  ({ data, setOpen, setFormData, setTasks, boardId, style, attributes, listeners }, ref) => {
    const columns = useColumns();
    const otherColumns = columns.filter((c) => c._id !== data.column);
    const tags = data.tag ? data.tag.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const avatarColor = data.assignee ? getAvatarColor(data.assignee) : "bg-slate-400";
    const initials = data.initials || (data.assignee ? data.assignee.charAt(0).toUpperCase() : "?");

    return (
      <Card
        ref={ref}
        {...listeners}
        {...attributes}
        style={style}
        className="w-full bg-white border border-slate-300 shadow-sm hover:shadow-lg hover:border-slate-400 transition-all duration-150 cursor-grab active:cursor-grabbing rounded-xl overflow-hidden"
      >
        <CardHeader className="relative pb-2 pt-4 px-4">
          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreVertical size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-white border border-slate-300 shadow-xl rounded-xl p-1 min-w-44 text-slate-800"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {setFormData && setOpen && (
                <DropdownMenuItem
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 text-sm font-medium"
                  onClick={() => { setFormData(data); setOpen(true); }}
                >
                  <Pencil size={14} className="text-blue-500" />
                  Edit Card
                </DropdownMenuItem>
              )}
              {setTasks && (
                <DropdownMenuItem
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-rose-50 text-sm font-medium text-rose-600"
                  onClick={() => {
                    deleteCard(data._id!, boardId);
                    setTasks((prev) => prev.filter((t) => String(t._id) !== String(data._id)));
                  }}
                >
                  <Trash2 size={14} className="text-rose-500" />
                  Delete
                </DropdownMenuItem>
              )}
              {setTasks && otherColumns.length > 0 && (
                <div className="my-1 border-t border-slate-200" />
              )}
              {setTasks && otherColumns.map((c) => (
                <DropdownMenuItem
                  key={c._id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 text-sm font-medium"
                  onClick={async () => {
                    await changeCardColumn(String(data._id), c._id, boardId);
                    setTasks((prev) =>
                      prev.map((t) => String(t._id) === String(data._id) ? { ...t, column: c._id } : t)
                    );
                  }}
                >
                  <ArrowRightFromLine size={14} className="text-emerald-500" />
                  Move to {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <CardTitle className="text-sm font-semibold text-slate-900 pr-8 leading-snug">
            {data.title}
          </CardTitle>
          {data.description && (
            <CardDescription className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
              {data.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-1 space-y-2.5">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${TAG_COLORS[index % 5]}`}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {data.assignee && (
            <div className="flex items-center gap-2 pt-0.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0 ${avatarColor}`}>
                {initials}
              </div>
              <span className="text-xs text-slate-600 font-medium truncate">{data.assignee}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
TaskCardUI.displayName = "TaskCardUI";

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({ data, setOpen, setFormData, setTasks, boardId }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(data._id),
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
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

// ─── Column ───────────────────────────────────────────────────────────────────

const Column = memo(function Column({ col, tasks, setTasks, boardId }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: col._id });

  const colTasks = useMemo(
    () => tasks.filter((t) => t.column === col._id),
    [tasks, col._id]
  );

  const sortableIds = useMemo(
    () => colTasks.map((t) => String(t._id)),
    [colTasks]
  );

  const [editColOpen, setEditColOpen] = useState<boolean>(false);
  const [cardDialogOpen, setCardDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<KanBan>({
    title: "", description: "", tag: "", assignee: "", initials: "", column: "",
  });

  return (
    <div className="flex flex-col w-full sm:w-72 md:w-76 lg:w-80 shrink-0">
      {/* Column header */}
      <div className="group/col flex items-center justify-between gap-2 mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
            {col.name}
          </h2>
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-300 text-[11px] font-bold text-slate-700">
            {colTasks.length}
          </span>
        </div>

        <div className="opacity-0 group-hover/col:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer">
                <MoreVertical size={15} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-slate-300 shadow-xl rounded-xl p-1 min-w-40 text-slate-800">
              <DropdownMenuItem
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 text-sm font-medium"
                onClick={() => setEditColOpen(true)}
              >
                <Pencil size={14} className="text-blue-500" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-rose-50 text-sm font-medium text-rose-600"
                onClick={async () => { await deleteColumn(col._id, boardId); }}
              >
                <Trash2 size={14} className="text-rose-500" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Column body */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2.5 bg-slate-200 border border-slate-300 px-2.5 py-2.5 rounded-2xl min-h-[8rem] flex-1"
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {colTasks.map((data) => (
            <TaskCard
              key={String(data._id)}
              data={data}
              setOpen={setCardDialogOpen}
              setFormData={setFormData}
              setTasks={setTasks}
              boardId={boardId}
            />
          ))}
        </SortableContext>

        {/* Add card */}
        <button
          onClick={() => {
            setFormData({ title: "", description: "", tag: "", assignee: "", initials: "", column: "" });
            setCardDialogOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-dashed border-slate-400 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 text-xs font-semibold cursor-pointer mt-0.5"
        >
          <Plus size={13} />
          Add card
        </button>
      </div>

      {/* Dialogs */}
      <CardDialog
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
        formData={formData}
        setFormData={setFormData}
        colId={col._id}
        colName={col.name}
        boardId={boardId}
      />
      <EditColumnDialog
        open={editColOpen}
        onOpenChange={setEditColOpen}
        colId={col._id}
        colName={col.name}
        boardId={boardId}
      />
    </div>
  );
});

// ─── Board (Root) ─────────────────────────────────────────────────────────────

export default function Board({ columns, fetchedCardsFromDb, boardId }: BoardProps) {
  const id = useId();
  const [addColOpen, setAddColOpen] = useState<boolean>(false);
  const [tasks, setTasks] = useState<KanBan[]>(fetchedCardsFromDb);
  const [activeTask, setActiveTask] = useState<KanBan | null>(null);

  const tasksRef = useRef<KanBan[]>(fetchedCardsFromDb);
  const columnIdsRef = useRef<Set<string>>(new Set(columns.map((c) => c._id)));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    setTasks(fetchedCardsFromDb);
    tasksRef.current = fetchedCardsFromDb;
  }, [fetchedCardsFromDb]);

  useEffect(() => {
    columnIdsRef.current = new Set(columns.map((c) => c._id));
  }, [columns]);

  const stableColumns = useMemo(
    () => columns,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns.map((c) => c._id).join(",")]
  );

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
    const task = tasksRef.current.find((t) => String(t._id) === event.active.id);
    setActiveTask(task ?? null);
  }



  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const taskId = String(active.id);
    const current = tasksRef.current;

    const activeIndex = current.findIndex((t) => String(t._id) === taskId);
    if (activeIndex === -1) return;

    const overId = String(over.id);
    const overIsColumn = columnIdsRef.current.has(overId);
    const overTask = current.find((t) => String(t._id) === overId);
    const overColumn = overIsColumn ? overId : overTask?.column;

    if (!overColumn) return;

    const dragged = current[activeIndex];
    let updated = current;

    if (dragged.column !== overColumn) {
      // Remove dragged card from current position, assign new column
      const without = current.filter((t) => String(t._id) !== taskId);
      const movedCard = { ...dragged, column: overColumn };

      if (!overIsColumn) {
        // Dropped on a specific card in the target column
        // Find where that card sits in the filtered array
        const overIndex = without.findIndex((t) => String(t._id) === overId);
        if (overIndex !== -1) {
          updated = [
            ...without.slice(0, overIndex),
            movedCard,
            ...without.slice(overIndex),
          ];
        } else {
          updated = [...without, movedCard];
        }
      } else {
        // Dropped on column header — append at end of that column
        updated = [...without, movedCard];
      }
      void updateCardColumn(taskId, overColumn, boardId);
    } else if (!overIsColumn && taskId !== overId) {
      // reordered within same column
      const overIndex = current.findIndex((t) => String(t._id) === overId);
      if (overIndex !== -1 && activeIndex !== overIndex) {
        updated = arrayMove(current, activeIndex, overIndex);
      }
    }

    const withNewOrder = updated.map((task, index) => ({ ...task, order: index }));
    // Update UI immediately before any async DB calls to prevent flash
    syncSetTasks(withNewOrder);
    // Fire DB calls without awaiting so UI stays stable
    void saveOrder(withNewOrder, boardId);
  }

  return (
    <ColumnsContext.Provider value={stableColumns}>
      {/* Page shell */}
      <div className="min-h-screen w-full bg-white">
        {/* Scrollable board area */}
        <div className="w-full overflow-x-auto">
          <div className="flex items-start gap-4 px-4 sm:px-6 lg:px-8 py-6 min-h-screen
                          flex-col sm:flex-row sm:flex-nowrap">
            <DndContext
              id={id}
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {/* On mobile: stacked. On sm+: horizontal scroll row */}
              <div className="flex flex-col gap-4 w-full
                              sm:flex-row sm:items-start sm:gap-4 sm:w-auto">
                {columns.map((col) => (
                  <Column key={col._id} col={col} tasks={tasks} setTasks={syncSetTasks} boardId={boardId} />
                ))}

                {/* Add column */}
                <div className="flex sm:items-start w-full sm:w-auto pt-0.5">
                  <button
                    onClick={() => setAddColOpen(true)}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto h-9 px-4 rounded-xl border border-dashed border-slate-400 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  >
                    <Plus size={14} />
                    Add Column
                  </button>
                </div>
              </div>

              <DragOverlay>
                {activeTask ? (
                  <TaskCardUI data={activeTask} boardId={boardId} />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      <AddColumnDialog open={addColOpen} onOpenChange={setAddColOpen} boardId={boardId} />
    </ColumnsContext.Provider>
  );
}