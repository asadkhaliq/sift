"use client";

import { Todo } from "@/lib/types";

interface TodoItemProps {
  todo: Todo;
  isSelected: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onEdit: (content: string) => void;
}

export function TodoItem({
  todo,
  isSelected,
  onSelect,
  onToggleComplete,
}: TodoItemProps) {
  const isCompleted = !!todo.completedAt;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={onSelect}
      onDoubleClick={onToggleComplete}
      className={`
        flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none
        transition-colors duration-75
        ${isSelected ? "bg-bg-2" : "hover:bg-bg"}
        ${isCompleted ? "text-tx-3 line-through" : "text-tx"}
      `}
    >
      <span className="text-tx-3 w-4 flex-shrink-0">
        {isSelected ? "›" : " "}
      </span>
      <span className="truncate">
        {todo.content}
        {todo.waitingFor && (
          <span className="text-tx-2 ml-2">— {todo.waitingFor}</span>
        )}
      </span>
    </div>
  );
}
