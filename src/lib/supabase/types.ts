export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          pane: "today" | "work" | "personal" | "waiting";
          position: number;
          waiting_for: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          pane: "today" | "work" | "personal" | "waiting";
          position: number;
          waiting_for?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          pane?: "today" | "work" | "personal" | "waiting";
          position?: number;
          waiting_for?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      user_context: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          updated_at?: string;
        };
      };
    };
  };
}
