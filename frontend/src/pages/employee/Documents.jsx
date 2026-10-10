import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useResource } from "../../hooks/useResource.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { downloadFromApi } from "../../utils/download.js";
import { formatDateTime } from "../../utils/format.js";

export default function EmployeeDocuments() {
  const { user } = useAuth();
  const { items, loading, error, reload } = useResource("/documents");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const toast = useToast();

  async function upload(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const form = new FormData(event.currentTarget);
      await api.post(`/documents/${user.employee._id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document uploaded");
      event.currentTarget.reset();
      reload();
    } catch (requestError) {
      setFormError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">My Documents</h1>
      <Card>
        <CardHeader title="Upload Document" />
        <CardBody>
          {formError ? <p className="mb-3 text-sm text-red-600">{formError}</p> : null}
          <form className="grid gap-4 sm:grid-cols-3" onSubmit={upload}>
            <Input label="Document type" name="type" required />
            <Input label="File" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg" required />
            <div className="flex items-end"><Button icon={Upload} type="submit" loading={saving}>Upload</Button></div>
          </form>
        </CardBody>
      </Card>
      <DataTable
        columns={[
          { key: "type", label: "Type" },
          { key: "originalName", label: "File" },
          { key: "createdAt", label: "Uploaded", render: (row) => formatDateTime(row.createdAt) },
          { key: "actions", label: "Actions", render: (row) => <Button icon={Download} variant="secondary" onClick={() => downloadFromApi(`/documents/${row._id}/download`, row.originalName)}>Download</Button> },
        ]}
        rows={items}
        loading={loading}
        error={error}
      />
    </div>
  );
}
