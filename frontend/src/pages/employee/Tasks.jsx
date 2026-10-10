import { CheckCircle, Play } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDate } from "../../utils/format.js";

export default function EmployeeTasks() {
  return (
    <ResourcePage
      title="My Tasks"
      endpoint="/tasks"
      columns={[
        { key: "title", label: "Task" },
        { key: "priority", label: "Priority", render: (row) => <Badge value={row.priority} /> },
        { key: "deadline", label: "Deadline", render: (row) => formatDate(row.deadline) },
        { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
        { key: "progress", label: "Progress", render: (row) => `${row.progress || 0}%` },
      ]}
      rowActions={[
        { label: "Start", icon: Play, path: (row) => `/tasks/${row._id}`, body: { status: "in_progress", progress: 10 }, disabled: (row) => row.status !== "todo" },
        { label: "Complete", icon: CheckCircle, path: (row) => `/tasks/${row._id}`, body: { status: "completed", progress: 100 }, disabled: (row) => row.status === "completed" },
      ]}
    />
  );
}
