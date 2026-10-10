import { CheckCircle } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDateTime } from "../../utils/format.js";

export default function Tickets() {
  return (
    <ResourcePage
      title="Tickets and HR Support"
      endpoint="/tickets"
      columns={[
        { key: "ticketNo", label: "Ticket" },
        { key: "subject", label: "Subject" },
        { key: "employee", label: "Employee", render: (row) => row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : "-" },
        { key: "category", label: "Category" },
        { key: "priority", label: "Priority", render: (row) => <Badge value={row.priority} /> },
        { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
        { key: "createdAt", label: "Created", render: (row) => formatDateTime(row.createdAt) },
      ]}
      filters={[
        { name: "status", label: "Status", options: ["open", "assigned", "in_progress", "resolved", "closed"].map((value) => ({ value, label: value })) },
        { name: "priority", label: "Priority", options: ["low", "medium", "high", "urgent"].map((value) => ({ value, label: value })) },
      ]}
      rowActions={[
        { label: "Resolve", icon: CheckCircle, path: (row) => `/tickets/${row._id}`, body: { status: "resolved", comment: "Resolved by HR" }, disabled: (row) => row.status === "resolved" || row.status === "closed" },
      ]}
    />
  );
}
