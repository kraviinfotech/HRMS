import { humanize } from "../../utils/format.js";

const toneMap = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  finalized: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  present: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  submitted: "bg-amber-50 text-amber-700 ring-amber-200",
  draft: "bg-slate-50 text-slate-700 ring-slate-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  inactive: "bg-red-50 text-red-700 ring-red-200",
  urgent: "bg-red-50 text-red-700 ring-red-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  medium: "bg-blue-50 text-blue-700 ring-blue-200",
  low: "bg-slate-50 text-slate-700 ring-slate-200",
};

export function Badge({ value }) {
  const tone = toneMap[value] || "bg-slate-50 text-slate-700 ring-slate-200";
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ${tone}`}>{humanize(value)}</span>;
}
