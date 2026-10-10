import { useResource } from "../../hooks/useResource.js";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { formatDateTime } from "../../utils/format.js";

export default function AuditLogs() {
  const { items, meta, loading, error } = useResource("/admin/audit-logs");
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Audit Logs</h1>
      <DataTable
        columns={[
          { key: "createdAt", label: "Time", render: (row) => formatDateTime(row.createdAt) },
          { key: "actor", label: "Actor", render: (row) => row.actor?.email || "System" },
          { key: "action", label: "Action" },
          { key: "entity", label: "Entity" },
          { key: "ip", label: "IP" },
        ]}
        rows={items}
        meta={meta}
        loading={loading}
        error={error}
      />
    </div>
  );
}
