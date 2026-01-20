"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pane } from "@/components/Pane";
import { QuickAdd } from "@/components/QuickAdd";
import { KeyboardHelp } from "@/components/KeyboardHelp";
import { createClient } from "@/lib/supabase/client";
import { Todo, PaneId, PANES } from "@/lib/types";
import type { Database } from "@/lib/supabase/types";
import type { User } from "@supabase/supabase-js";

type TodoRow = Database["public"]["Tables"]["todos"]["Row"];

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Check auth and fetch todos
  useEffect(() => {
    const checkAuthAndFetchTodos = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("position", { ascending: true })
        .returns<TodoRow[]>();

      if (error) {
        console.error("Error fetching todos:", error);
      } else if (data) {
        setTodos(data.map((t) => ({
          id: t.id,
          content: t.content,
          pane: t.pane as PaneId,
          position: t.position,
          waitingFor: t.waiting_for || undefined,
          createdAt: new Date(t.created_at),
          completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
        })));
      }

      setLoading(false);
    };

    checkAuthAndFetchTodos();
  }, [supabase, router]);

  const getTodosForPane = useCallback(
    (paneId: PaneId) => todos.filter((t) => t.pane === paneId).sort((a, b) => a.position - b.position),
    [todos]
  );

  // Add todo
  const addTodo = async (content: string) => {
    if (!user) return;

    const position = getTodosForPane("today").length;

    const { data, error } = await supabase
      .from("todos")
      .insert({
        user_id: user.id,
        content,
        pane: "today",
        position,
      })
      .select()
      .single();

    const typedData = data as TodoRow | null;

    if (error) {
      console.error("Error adding todo:", error);
      return;
    }

    if (typedData) {
      setTodos(prev => [...prev, {
        id: typedData.id,
        content: typedData.content,
        pane: typedData.pane as PaneId,
        position: typedData.position,
        waitingFor: typedData.waiting_for || undefined,
        createdAt: new Date(typedData.created_at),
        completedAt: typedData.completed_at ? new Date(typedData.completed_at) : undefined,
      }]);
    }
  };

  // Toggle complete
  const toggleComplete = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const completedAt = todo.completedAt ? null : new Date().toISOString();

    const { error } = await supabase
      .from("todos")
      .update({ completed_at: completedAt })
      .eq("id", todoId);

    if (error) {
      console.error("Error toggling todo:", error);
      return;
    }

    setTodos(prev => prev.map(t =>
      t.id === todoId
        ? { ...t, completedAt: completedAt ? new Date(completedAt) : undefined }
        : t
    ));
  };

  // Delete todo
  const deleteTodo = async (todoId: string) => {
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", todoId);

    if (error) {
      console.error("Error deleting todo:", error);
      return;
    }

    setTodos(prev => prev.filter(t => t.id !== todoId));
  };

  // Edit todo
  const editTodo = async (todoId: string, content: string) => {
    const { error } = await supabase
      .from("todos")
      .update({ content })
      .eq("id", todoId);

    if (error) {
      console.error("Error editing todo:", error);
      return;
    }

    setTodos(prev => prev.map(t =>
      t.id === todoId ? { ...t, content } : t
    ));
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
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
            toggleComplete(todoToToggle.id);
          }
          break;

        case "d":
        case "Backspace":
          e.preventDefault();
          const todoToDelete = paneTodos[currentIndex];
          if (todoToDelete) {
            deleteTodo(todoToDelete.id);
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <p className="text-tx-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-paper p-4 gap-4">
      {/* Header */}
      <header className="flex items-center justify-between px-2">
        <h1 className="text-lg font-medium text-tx">Sift</h1>
        <div className="flex items-center gap-4 text-xs text-tx-3">
          <span>/ to add</span>
          <span>? for help</span>
          <button
            onClick={signOut}
            className="hover:text-tx transition-colors"
          >
            Sign out
          </button>
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
            onToggleComplete={toggleComplete}
            onDeleteTodo={deleteTodo}
            onEditTodo={editTodo}
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
              onToggleComplete={toggleComplete}
              onDeleteTodo={deleteTodo}
              onEditTodo={editTodo}
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
        onSubmit={addTodo}
      />
      <KeyboardHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
