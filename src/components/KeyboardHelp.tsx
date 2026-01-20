"use client";

interface KeyboardHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: "↑ / ↓", description: "Navigate within pane" },
  { key: "1 2 3 4", description: "Switch pane" },
  { key: "/", description: "Add new todo" },
  { key: "Space", description: "Toggle complete" },
  { key: "d", description: "Delete todo" },
  { key: "m", description: "Move to pane..." },
  { key: "?", description: "Toggle this help" },
  { key: "Esc", description: "Close / Cancel" },
];

export function KeyboardHelp({ isOpen, onClose }: KeyboardHelpProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tx/10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-paper border border-ui rounded-sm shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ui bg-bg">
          <h2 className="text-sm font-medium text-tx">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-tx-2 hover:text-tx text-xs"
          >
            Esc
          </button>
        </div>
        <div className="p-4 space-y-2">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-tx-2">{description}</span>
              <kbd className="px-2 py-0.5 text-xs bg-bg border border-ui rounded text-tx">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
