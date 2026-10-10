import { Check, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDate } from "../../utils/format.js";

export default function Leaves() {
  return (
    <ResourcePage
      title="Leave Management"
      endpoint="/leaves"
      columns={[
        { key: "employee", label: "Employee", render: (row) => row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : "-" },
        { key: "type", label: "Type" },
        { key: "startDate", label: "From", render: (row) => formatDate(row.startDate) },
        { key: "endDate", label: "To", render: (row) => formatDate(row.endDate) },
        { key: "days", label: "Days" },
        { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
      ]}
      filters={[{ name: "status", label: "Status", options: ["pending", "approved", "rejected", "cancelled"].map((value) => ({ value, label: value })) }]}
      rowActions={[
        { label: "Approve", icon: Check, path: (row) => `/leaves/${row._id}/review`, body: { status: "approved", note: "Approved" }, disabled: (row) => row.status !== "pending" },
        { label: "Reject", icon: X, variant: "danger", path: (row) => `/leaves/${row._id}/review`, body: { status: "rejected", note: "Rejected" }, disabled: (row) => row.status !== "pending" },
      ]}
    />
  );
}
