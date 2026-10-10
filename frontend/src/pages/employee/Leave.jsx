import { XCircle } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDate } from "../../utils/format.js";

const fields = [
  { name: "type", label: "Leave type", type: "select", options: ["Casual Leave", "Sick Leave", "Earned Leave"].map((value) => ({ value, label: value })) },
  { name: "startDate", label: "Start date", type: "date", required: true },
  { name: "endDate", label: "End date", type: "date", required: true },
  { name: "halfDay", label: "Half day", type: "checkbox" },
  { name: "reason", label: "Reason", type: "textarea", required: true },
];

export default function EmployeeLeave() {
  return (
    <ResourcePage
      title="My Leave"
      endpoint="/leaves"
      createLabel="Apply leave"
      fields={fields}
      columns={[
        { key: "type", label: "Type" },
        { key: "startDate", label: "From", render: (row) => formatDate(row.startDate) },
        { key: "endDate", label: "To", render: (row) => formatDate(row.endDate) },
        { key: "days", label: "Days" },
        { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
      ]}
      rowActions={[{ label: "Cancel", icon: XCircle, variant: "danger", method: "post", path: (row) => `/leaves/${row._id}/cancel`, body: {}, disabled: (row) => row.status !== "pending" }]}
    />
  );
}
