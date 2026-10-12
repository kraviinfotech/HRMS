import { useResource } from "../../hooks/useResource.js";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { formatDateTime } from "../../utils/format.js";

function locationCell(row) {
  const location = row.metadata?.location;
  if (!location?.googleMapsUrl) return "-";

  return (
    <a className="font-medium text-blue-600 hover:underline dark:text-blue-400" href={location.googleMapsUrl} target="_blank" rel="noreferrer">
      {Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}
    </a>
  );
}

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
          { key: "location", label: "Location", render: locationCell },
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
