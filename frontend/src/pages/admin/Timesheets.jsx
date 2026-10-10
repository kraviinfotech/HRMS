import { Check, RotateCcw, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDate, minutesToHours } from "../../utils/format.js";

export default function Timesheets() {
  return (
    <ResourcePage
      title="Timesheet Management"
      endpoint="/timesheets"
      columns={[
        { key: "date", label: "Date", render: (row) => formatDate(row.date) },
        { key: "employee", label: "Employee", render: (row) => row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : "-" },
        { key: "totalMinutes", label: "Total", render: (row) => minutesToHours(row.totalMinutes) },
        { key: "entries", label: "Entries", render: (row) => row.entries?.length || 0 },
        { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
      ]}
      filters={[{ name: "status", label: "Status", options: ["draft", "submitted", "approved", "rejected", "correction_requested"].map((value) => ({ value, label: value })) }]}
      rowActions={[
        { label: "Approve", icon: Check, path: (row) => `/timesheets/${row._id}/review`, body: { status: "approved", note: "Approved" }, disabled: (row) => row.status !== "submitted" },
        { label: "Corrections", icon: RotateCcw, path: (row) => `/timesheets/${row._id}/review`, body: { status: "correction_requested", note: "Correction requested" }, disabled: (row) => row.status !== "submitted" },
        { label: "Reject", icon: X, variant: "danger", path: (row) => `/timesheets/${row._id}/review`, body: { status: "rejected", note: "Rejected" }, disabled: (row) => row.status !== "submitted" },
      ]}
    />
  );
}
