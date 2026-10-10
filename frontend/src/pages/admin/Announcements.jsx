import { Trash2 } from "lucide-react";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDate } from "../../utils/format.js";

const fields = [
  { name: "title", label: "Title", required: true },
  { name: "audience", label: "Audience", type: "select", options: ["all", "admins", "employees"].map((value) => ({ value, label: value })) },
  { name: "publishAt", label: "Publish at", type: "date" },
  { name: "expiresAt", label: "Expires at", type: "date" },
  { name: "body", label: "Message", type: "textarea", required: true },
];

export default function Announcements() {
  return (
    <ResourcePage
      title="Announcements"
      endpoint="/admin/announcements"
      createLabel="Create announcement"
      fields={fields}
      columns={[
        { key: "title", label: "Title" },
        { key: "audience", label: "Audience" },
        { key: "publishAt", label: "Publish", render: (row) => formatDate(row.publishAt) },
        { key: "expiresAt", label: "Expires", render: (row) => formatDate(row.expiresAt) },
      ]}
      rowActions={[{ label: "Delete", icon: Trash2, variant: "danger", method: "delete", path: (row) => `/admin/announcements/${row._id}`, confirmMessage: "Delete this announcement?" }]}
    />
  );
}
