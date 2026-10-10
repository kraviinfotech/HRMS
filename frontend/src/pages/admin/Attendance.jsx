import { Check, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDate, formatDateTime, minutesToHours } from "../../utils/format.js";

export default function Attendance() {
  return (
    <ResourcePage
      title="Attendance Management"
      endpoint="/attendance"
      columns={[
        { key: "date", label: "Date", render: (row) => formatDate(row.date) },
        { key: "employee", label: "Employee", render: (row) => row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : "-" },
        { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
        { key: "checkInAt", label: "Check in", render: (row) => formatDateTime(row.checkInAt) },
        { key: "checkOutAt", label: "Check out", render: (row) => formatDateTime(row.checkOutAt) },
        { key: "durationMinutes", label: "Duration", render: (row) => minutesToHours(row.durationMinutes) },
        { key: "correction", label: "Correction", render: (row) => <Badge value={row.correctionRequest?.status || "none"} /> },
      ]}
      filters={[{ name: "status", label: "Status", options: ["present", "absent", "late", "half_day", "on_leave", "missing_checkout"].map((value) => ({ value, label: value })) }]}
      rowActions={[
        {
          label: "Approve",
          icon: Check,
          path: (row) => `/attendance/${row._id}/correction`,
          body: { status: "approved", note: "Approved by admin" },
          disabled: (row) => row.correctionRequest?.status !== "pending",
        },
        {
          label: "Reject",
          icon: X,
          variant: "danger",
          path: (row) => `/attendance/${row._id}/correction`,
          body: { status: "rejected", note: "Rejected by admin" },
          disabled: (row) => row.correctionRequest?.status !== "pending",
        },
      ]}
    />
  );
}
