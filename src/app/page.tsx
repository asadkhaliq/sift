"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Pane } from "@/components/Pane";
import { QuickAdd } from "@/components/QuickAdd";
import { KeyboardHelp } from "@/components/KeyboardHelp";
import { Todo, PaneId, PANES } from "@/lib/types";

// Temporary ID generator until we have Supabase
const generateId = () => Math.random().toString(36).substring(2, 9);

// Sample data for testing
const initialTodos: Todo[] = [
  { id: "1", content: "Review project proposal", pane: "today", position: 0, createdAt: new Date() },
  { id: "2", content: "Fix login bug", pane: "today", position: 1, createdAt: new Date() },
  { id: "3", content: "Update documentation", pane: "work", position: 0, createdAt: new Date() },
  { id: "4", content: "Prepare presentation", pane: "work", position: 1, createdAt: new Date() },
  { id: "5", content: "Schedule dentist appointment", pane: "personal", position: 0, createdAt: new Date() },
  { id: "6", content: "Response from client", pane: "waiting", position: 0, waitingFor: "John", createdAt: new Date() },
];

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [activePane, setActivePane] = useState<PaneId>("today");
  const [selectedIndices, setSelectedIndices] = useState<Record<PaneId, number>>({
    today: 0,
    work: 0,
    personal: 0,
    waiting: 0,
  });
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const paneRefs = useRef<Record<PaneId, HTMLDivElement | null>>({
    today: null,
    work: null,
    personal: null,
    waiting: null,
  });

  const getTodosForPane = useCallback(
    (paneId: PaneId) => todos.filter((t) => t.pane === paneId).sort((a, b) => a.position - b.position),
    [todos]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if input is focused or modals are open with input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const paneTodos = getTodosForPane(activePane);
      const currentIndex = selectedIndices[activePane];

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (currentIndex > 0) {
            setSelectedIndices((prev) => ({ ...prev, [activePane]: currentIndex - 1 }));
          }
          break;

        case "ArrowDown":
          e.preventDefault();
          if (currentIndex < paneTodos.length - 1) {
            setSelectedIndices((prev) => ({ ...prev, [activePane]: currentIndex + 1 }));
          }
          break;

        case "1":
        case "2":
        case "3":
        case "4":
          e.preventDefault();
          const paneIndex = parseInt(e.key) - 1;
          const pane = PANES[paneIndex];
          if (pane) {
            setActivePane(pane.id);
            paneRefs.current[pane.id]?.focus();
          }
          break;

        case "/":
          e.preventDefault();
          setShowQuickAdd(true);
          break;

        case "?":
          e.preventDefault();
          setShowHelp((prev) => !prev);
          break;

        case " ":
          e.preventDefault();
          const todoToToggle = paneTodos[currentIndex];
          if (todoToToggle) {
            setTodos((prev) =>
              prev.map((t) =>
                t.id === todoToToggle.id
                  ? { ...t, completedAt: t.completedAt ? undefined : new Date() }
                  : t
              )
            );
          }
          break;

        case "d":
        case "Backspace":
          e.preventDefault();
          const todoToDelete = paneTodos[currentIndex];
          if (todoToDelete) {
            setTodos((prev) => prev.filter((t) => t.id !== todoToDelete.id));
            // Adjust selection if needed
            if (currentIndex >= paneTodos.length - 1 && currentIndex > 0) {
              setSelectedIndices((prev) => ({ ...prev, [activePane]: currentIndex - 1 }));
            }
          }
          break;

        case "Escape":
          e.preventDefault();
          setShowHelp(false);
          setShowQuickAdd(false);
          break;
      }
    },
    [activePane, selectedIndices, getTodosForPane]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleAddTodo = (content: string) => {
    const newTodo: Todo = {
      id: generateId(),
      content,
      pane: "today", // All new todos go to Today for v1
      position: getTodosForPane("today").length,
      createdAt: new Date(),
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  return (
    <div className="h-screen flex flex-col bg-paper p-4 gap-4">
      {/* Header */}
      <header className="flex items-center justify-between px-2">
        <h1 className="text-lg font-medium text-tx">Sift</h1>
        <div className="flex items-center gap-4 text-xs text-tx-3">
          <span>/ to add</span>
          <span>? for help</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col gap-4 min-h-0">
        {/* Today pane - top half */}
        <div className="flex-1 min-h-0">
          <Pane
            ref={(el) => { paneRefs.current.today = el; }}
            pane={PANES[0]}
            todos={getTodosForPane("today")}
            isActive={activePane === "today"}
            selectedIndex={selectedIndices.today}
            onActivate={() => setActivePane("today")}
            onSelectTodo={(index) => {
              setActivePane("today");
              setSelectedIndices((prev) => ({ ...prev, today: index }));
            }}
            onToggleComplete={(id) =>
              setTodos((prev) =>
                prev.map((t) =>
                  t.id === id ? { ...t, completedAt: t.completedAt ? undefined : new Date() } : t
                )
              )
            }
            onDeleteTodo={(id) => setTodos((prev) => prev.filter((t) => t.id !== id))}
            onEditTodo={(id, content) =>
              setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, content } : t)))
            }
          />
        </div>

        {/* Bottom panes - Work, Personal, Waiting */}
        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {PANES.slice(1).map((pane) => (
            <Pane
              key={pane.id}
              ref={(el) => { paneRefs.current[pane.id] = el; }}
              pane={pane}
              todos={getTodosForPane(pane.id)}
              isActive={activePane === pane.id}
              selectedIndex={selectedIndices[pane.id]}
              onActivate={() => setActivePane(pane.id)}
              onSelectTodo={(index) => {
                setActivePane(pane.id);
                setSelectedIndices((prev) => ({ ...prev, [pane.id]: index }));
              }}
              onToggleComplete={(id) =>
                setTodos((prev) =>
                  prev.map((t) =>
                    t.id === id ? { ...t, completedAt: t.completedAt ? undefined : new Date() } : t
                  )
                )
              }
              onDeleteTodo={(id) => setTodos((prev) => prev.filter((t) => t.id !== id))}
              onEditTodo={(id, content) =>
                setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, content } : t)))
              }
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-2 text-xs text-tx-3">
        <span>↑↓ navigate</span>
        <span>1-4 switch pane</span>
      </footer>

      {/* Modals */}
      <QuickAdd
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSubmit={handleAddTodo}
      />
      <KeyboardHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
