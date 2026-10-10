import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "./Button.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { Spinner } from "./Spinner.jsx";

export function DataTable({
  columns,
  rows,
  loading,
  error,
  meta,
  onPage,
  search,
  onSearch,
  actions,
  emptyTitle = "No records found",
}) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        {onSearch ? (
          <label className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="focus-ring w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              placeholder="Search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />
          </label>
        ) : (
          <span />
        )}
        {actions}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <div className="p-5 text-sm text-red-600">{error}</div>
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="whitespace-nowrap px-4 py-3 font-semibold">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row) => (
                <tr key={row.id || row._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {column.render ? column.render(row) : row[column.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta ? (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <span>
            Page {meta.page} of {meta.pages} - {meta.total} records
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" icon={ChevronLeft} disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
              Prev
            </Button>
            <Button variant="secondary" icon={ChevronRight} disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
