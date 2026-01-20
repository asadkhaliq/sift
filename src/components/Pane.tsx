"use client";

import { forwardRef } from "react";
import { Todo, Pane as PaneType } from "@/lib/types";
import { TodoItem } from "./TodoItem";

interface PaneProps {
  pane: PaneType;
  todos: Todo[];
  isActive: boolean;
  selectedIndex: number;
  onActivate: () => void;
  onSelectTodo: (index: number) => void;
  onToggleComplete: (todoId: string) => void;
  onDeleteTodo: (todoId: string) => void;
  onEditTodo: (todoId: string, content: string) => void;
}

export const Pane = forwardRef<HTMLDivElement, PaneProps>(function Pane(
  {
    pane,
    todos,
    isActive,
    selectedIndex,
    onActivate,
    onSelectTodo,
    onToggleComplete,
    onDeleteTodo,
    onEditTodo,
  },
  ref
) {
  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={pane.title}
      tabIndex={0}
      onClick={onActivate}
      onFocus={onActivate}
      className={`
        flex flex-col min-h-0 overflow-hidden
        border border-ui rounded-sm
        ${isActive ? "ring-2 ring-focus ring-offset-2 ring-offset-paper" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-ui bg-bg">
        <div className="flex items-center gap-2">
          <span className="text-tx-2 text-xs">[{pane.shortcut}]</span>
          <h2 className="text-sm font-medium tracking-wide text-tx">
            {pane.title}
          </h2>
        </div>
        <span className="text-tx-3 text-xs">{todos.length}</span>
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto py-1">
        {todos.length === 0 ? (
          <div className="px-3 py-4 text-tx-3 text-sm text-center">
            No items
          </div>
        ) : (
          todos.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isSelected={isActive && selectedIndex === index}
              onSelect={() => onSelectTodo(index)}
              onToggleComplete={() => onToggleComplete(todo.id)}
              onDelete={() => onDeleteTodo(todo.id)}
              onEdit={(content) => onEditTodo(todo.id, content)}
            />
          ))
        )}
      </div>
    </div>
  );
});
