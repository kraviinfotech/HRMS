import { Inbox } from "lucide-react";

export function EmptyState({ title = "Nothing here yet", action }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 p-8 text-center text-slate-500 dark:text-slate-400">
      <Inbox className="h-8 w-8" />
      <p className="text-sm font-medium">{title}</p>
      {action}
    </div>
  );
}
