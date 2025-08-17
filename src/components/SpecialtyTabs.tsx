import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";

type Props = {
  tabs: string[];
  active: string;
  onSelect: (name: string) => void;
  onAdd: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
};

const SpecialtyTabs: React.FC<Props> = ({ tabs, active, onSelect, onAdd, onRename, onDelete }) => {
  const [adding, setAdding] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  const [editing, setEditing] = React.useState<string | null>(null);
  const [editVal, setEditVal] = React.useState("");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Specialties</h3>
        {!adding ? (
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        ) : (
          <div className="flex gap-2">
            <input
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              placeholder="New specialty"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) {
                  onAdd(newName.trim());
                  setNewName("");
                  setAdding(false);
                } else if (e.key === "Escape") {
                  setAdding(false);
                  setNewName("");
                }
              }}
            />
            <Button
              size="icon"
              variant="secondary"
              onClick={() => {
                if (!newName.trim()) return;
                onAdd(newName.trim());
                setNewName("");
                setAdding(false);
              }}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => (setAdding(false), setNewName(""))}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-1 max-h[60vh] sm:max-h-[60vh] overflow-auto pr-1">
        {tabs.map((t) => {
          const isActive = t === active;
          const isEditing = editing === t;
          return (
            <div
              key={t}
              className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition ${
                isActive ? "bg-indigo-100 text-indigo-900" : "hover:bg-gray-100 text-gray-800"
              }`}
              onClick={() => !isEditing && onSelect(t)}
            >
              {!isEditing ? (
                <div className="truncate">{t}</div>
              ) : (
                <input
                  className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                  value={editVal}
                  autoFocus
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && editVal.trim()) {
                      onRename(t, editVal.trim());
                      setEditing(null);
                    } else if (e.key === "Escape") {
                      setEditing(null);
                    }
                  }}
                />
              )}

              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                {!isEditing ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(t);
                        setEditVal(t);
                      }}
                      title="Rename"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${t}"?`)) onDelete(t);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editVal.trim()) onRename(t, editVal.trim());
                        setEditing(null);
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={(e) => (e.stopPropagation(), setEditing(null))}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpecialtyTabs;
