import { Trash2 } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDate } from "../../utils/format.js";

const fields = [
  { name: "name", label: "Holiday name", required: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "type", label: "Type", type: "select", options: ["public", "company", "optional"].map((value) => ({ value, label: value })) },
  { name: "active", label: "Active", type: "checkbox" },
];

export default function Holidays() {
  return (
    <ResourcePage
      title="Company Holidays"
      endpoint="/admin/holidays"
      createLabel="Add holiday"
      fields={fields}
      columns={[
        { key: "name", label: "Name" },
        { key: "date", label: "Date", render: (row) => formatDate(row.date) },
        { key: "type", label: "Type", render: (row) => <Badge value={row.type} /> },
        { key: "active", label: "Active", render: (row) => (row.active ? "Yes" : "No") },
      ]}
      rowActions={[{ label: "Delete", icon: Trash2, variant: "danger", method: "delete", path: (row) => `/admin/holidays/${row._id}`, confirmMessage: "Delete this holiday?" }]}
    />
  );
}
