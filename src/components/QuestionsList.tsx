import React from "react";
import type { Question } from "@/pages/QuestionsPage";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, Trash2, GripVertical } from "lucide-react";

/** Simple drag reorder without external deps */
function useDragReorder<T>(list: T[], setList: (x: T[]) => void) {
  const dragIndex = React.useRef<number | null>(null);

  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === idx) return;
    const a = [...list];
    const [moved] = a.splice(dragIndex.current, 1);
    a.splice(idx, 0, moved);
    dragIndex.current = idx;
    setList(a);
  };
  const onDragEnd = () => {
    dragIndex.current = null;
  };

  return { onDragStart, onDragOver, onDragEnd };
}

type Props = {
  items: Question[];
  onChange: (next: Question[]) => void;
  onAdd: (text: string) => void;
  busy?: boolean;
  error?: string;
};

const QuestionsList: React.FC<Props> = ({ items, onChange, onAdd, busy, error }) => {
  const [draft, setDraft] = React.useState("");

  const setItem = (i: number, next: Partial<Question>) => {
    onChange(items.map((q, idx) => (idx === i ? { ...q, ...next, updatedAt: Date.now() } : q)));
  };
  const removeItem = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
  };

  const addNow = () => {
    if (!draft.trim()) return;
    onAdd(draft.trim());
    setDraft("");
  };

  const { onDragStart, onDragOver, onDragEnd } = useDragReorder(items, onChange);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Checklist</h3>
        <p className="text-sm text-gray-500">Click a question to edit. Drag to reorder.</p>
      </div>

      {/* Add new */}
      <div className="mb-4 flex gap-2">
        <input
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Add a question to ask your specialist…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addNow();
          }}
        />
        <Button onClick={addNow} disabled={!draft.trim()}>
          Add
        </Button>
      </div>

      {busy && <div className="mb-3 text-sm text-indigo-600">Generating suggestions…</div>}
      {!!error && <div className="mb-3 text-sm text-red-600">AI error: {error}</div>}

      {/* List */}
      <div className="flex-1 overflow-auto rounded-lg border border-gray-100">
        {items.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No questions yet. Use “Add” or “Generate”.</div>
        ) : (
          <ul className="divide-y">
            {items.map((q, i) => (
              <li
                key={q.id}
                className="group flex items-center gap-3 px-3 py-2"
                draggable
                onDragStart={onDragStart(i)}
                onDragOver={onDragOver(i)}
                onDragEnd={onDragEnd}
              >
                <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                <button
                  className="p-1 rounded hover:bg-gray-50"
                  onClick={() => setItem(i, { checked: !q.checked })}
                  title={q.checked ? "Uncheck" : "Check"}
                >
                  {q.checked ? (
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <EditableCell value={q.text} checked={q.checked} onChange={(v) => setItem(i, { text: v })} />

                <div className="ml-auto flex items-center gap-2">
                  {q.source && (
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 border border-gray-200 rounded px-1 py-0.5">
                      {q.source}
                    </span>
                  )}
                  <button className="p-1 rounded hover:bg-gray-50" onClick={() => removeItem(i)} title="Delete">
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const EditableCell: React.FC<{ value: string; onChange: (v: string) => void; checked?: boolean }> = ({
  value,
  onChange,
  checked,
}) => {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(value);

  React.useEffect(() => setVal(value), [value]);

  if (!editing) {
    return (
      <div
        className={`flex-1 text-sm ${checked ? "line-through text-gray-400" : "text-gray-800"} cursor-text`}
        onClick={() => setEditing(true)}
      >
        {value}
      </div>
    );
  }

  return (
    <input
      className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
      autoFocus
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        onChange(val.trim() || value);
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onChange(val.trim() || value);
          setEditing(false);
        } else if (e.key === "Escape") {
          setVal(value);
          setEditing(false);
        }
      }}
    />
  );
};

export default QuestionsList;
