"use client";

import { useState, useRef, useEffect } from "react";

interface QuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

export function QuickAdd({ isOpen, onClose, onSubmit }: QuickAddProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setValue("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-tx/10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-paper border border-ui rounded-sm shadow-lg overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-ui bg-bg">
          <span className="text-tx-2">/</span>
          <span className="text-sm text-tx">Add todo</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 bg-paper text-tx placeholder:text-tx-3 outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="flex items-center justify-between px-4 py-2 border-t border-ui bg-bg text-xs text-tx-3">
          <span>Enter to add</span>
          <span>Esc to cancel</span>
        </div>
      </form>
    </div>
  );
}
