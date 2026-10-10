import { CheckCircle } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDate } from "../../utils/format.js";

const fields = [
  { name: "title", label: "Title", required: true },
  { name: "assignee", label: "Assignee employee ID", required: true },
  { name: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "urgent"].map((value) => ({ value, label: value })) },
  { name: "startDate", label: "Start date", type: "date" },
  { name: "deadline", label: "Deadline", type: "date" },
  { name: "description", label: "Description", type: "textarea" },
];

export default function Tasks() {
  return (
    <ResourcePage
      title="Task Management"
      endpoint="/tasks"
      createLabel="Assign task"
      fields={fields}
      columns={[
        { key: "title", label: "Task" },
        { key: "assignee", label: "Assignee", render: (row) => row.assignee ? `${row.assignee.firstName} ${row.assignee.lastName}` : "-" },
        { key: "priority", label: "Priority", render: (row) => <Badge value={row.priority} /> },
        { key: "deadline", label: "Deadline", render: (row) => formatDate(row.deadline) },
        { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
        { key: "progress", label: "Progress", render: (row) => `${row.progress || 0}%` },
      ]}
      filters={[
        { name: "status", label: "Status", options: ["todo", "in_progress", "blocked", "completed", "cancelled"].map((value) => ({ value, label: value })) },
        { name: "priority", label: "Priority", options: ["low", "medium", "high", "urgent"].map((value) => ({ value, label: value })) },
      ]}
      rowActions={[{ label: "Complete", icon: CheckCircle, path: (row) => `/tasks/${row._id}`, body: { status: "completed", progress: 100 }, disabled: (row) => row.status === "completed" }]}
    />
  );
}
