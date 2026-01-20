export type PaneId = "today" | "work" | "personal" | "waiting";

export interface Todo {
  id: string;
  content: string;
  pane: PaneId;
  position: number;
  waitingFor?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Pane {
  id: PaneId;
  title: string;
  shortcut: string;
}

export const PANES: Pane[] = [
  { id: "today", title: "TODAY", shortcut: "1" },
  { id: "work", title: "WORK", shortcut: "2" },
  { id: "personal", title: "PERSONAL", shortcut: "3" },
  { id: "waiting", title: "WAITING FOR", shortcut: "4" },
];
