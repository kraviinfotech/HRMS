import { X } from "lucide-react";
import { Button } from "./Button.jsx";

export function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" icon={X} onClick={onClose} aria-label="Close" />
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
