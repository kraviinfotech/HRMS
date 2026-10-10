import { useState } from "react";
import { Send } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client.js";
import { useResource } from "../../hooks/useResource.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { formatDate, minutesToHours } from "../../utils/format.js";

export default function EmployeeTimesheets() {
  const { items, loading, error, reload } = useResource("/timesheets");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const toast = useToast();

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const form = new FormData(event.currentTarget);
      await api.post("/timesheets", {
        date: form.get("date"),
        entries: [{ description: form.get("description"), minutes: Number(form.get("minutes")) }],
      });
      toast.success("Timesheet saved");
      event.currentTarget.reset();
      reload();
    } catch (requestError) {
      setFormError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function submit(row) {
    setSaving(true);
    try {
      await api.post(`/timesheets/${row._id}/submit`);
      toast.success("Timesheet submitted");
      reload();
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">My Timesheets</h1>
      <Card>
        <CardHeader title="Daily Entry" />
        <CardBody>
          {formError ? <p className="mb-3 text-sm text-red-600">{formError}</p> : null}
          <form className="grid gap-4 sm:grid-cols-3" onSubmit={save}>
            <Input label="Date" name="date" type="date" required />
            <Input label="Minutes" name="minutes" type="number" min="1" max="1440" required />
            <Textarea className="sm:col-span-3" label="Description" name="description" required />
            <div className="sm:col-span-3"><Button type="submit" loading={saving}>Save draft</Button></div>
          </form>
        </CardBody>
      </Card>
      <DataTable
        columns={[
          { key: "date", label: "Date", render: (row) => formatDate(row.date) },
          { key: "totalMinutes", label: "Total", render: (row) => minutesToHours(row.totalMinutes) },
          { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
          { key: "actions", label: "Actions", render: (row) => <Button icon={Send} variant="secondary" disabled={row.status === "submitted" || row.status === "approved"} loading={saving} onClick={() => submit(row)}>Submit</Button> },
        ]}
        rows={items}
        loading={loading}
        error={error}
      />
    </div>
  );
}
