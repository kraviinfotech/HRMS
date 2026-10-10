import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { humanize } from "../../utils/format.js";

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {segments.map((segment, index) => {
        const to = `/${segments.slice(0, index + 1).join("/")}`;
        const last = index === segments.length - 1;
        return (
          <span key={to} className="flex items-center gap-2">
            {last ? <span className="font-medium text-slate-800 dark:text-slate-100">{humanize(segment)}</span> : <Link to={to}>{humanize(segment)}</Link>}
            {!last ? <ChevronRight className="h-3 w-3" /> : null}
          </span>
        );
      })}
    </nav>
  );
}
