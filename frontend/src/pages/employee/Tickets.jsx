import { MessageSquare } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDateTime } from "../../utils/format.js";

const fields = [
  { name: "category", label: "Category", required: true },
  { name: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "urgent"].map((value) => ({ value, label: value })) },
  { name: "subject", label: "Subject", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
];

export default function EmployeeTickets() {
  return (
    <ResourcePage
      title="My Tickets"
      endpoint="/tickets"
      createLabel="Create ticket"
      fields={fields}
      columns={[
        { key: "ticketNo", label: "Ticket" },
        { key: "subject", label: "Subject" },
        { key: "category", label: "Category" },
        { key: "priority", label: "Priority", render: (row) => <Badge value={row.priority} /> },
        { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
        { key: "createdAt", label: "Created", render: (row) => formatDateTime(row.createdAt) },
      ]}
      rowActions={[
        { label: "Reply", icon: MessageSquare, path: (row) => `/tickets/${row._id}`, body: { comment: "Acknowledged by employee" }, disabled: (row) => ["closed", "resolved"].includes(row.status) },
      ]}
    />
  );
}
