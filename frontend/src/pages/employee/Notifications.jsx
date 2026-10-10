import { Check } from "lucide-react";
import { useResource } from "../../hooks/useResource.js";
import { api, apiErrorMessage } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { formatDateTime } from "../../utils/format.js";

export default function Notifications() {
  const { items, meta, loading, error, reload } = useResource("/notifications");
  const toast = useToast();

  async function markRead(row) {
    try {
      await api.patch(`/notifications/${row._id}/read`);
      toast.success("Notification marked read");
      reload();
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError));
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "message", label: "Message" },
          { key: "createdAt", label: "Received", render: (row) => formatDateTime(row.createdAt) },
          { key: "readAt", label: "Read", render: (row) => formatDateTime(row.readAt) },
          { key: "actions", label: "Actions", render: (row) => <Button icon={Check} variant="secondary" disabled={Boolean(row.readAt)} onClick={() => markRead(row)}>Mark read</Button> },
        ]}
        rows={items}
        meta={meta}
        loading={loading}
        error={error}
      />
    </div>
  );
}
