import { useMemo, useState } from "react";
import { Check, Download, X } from "lucide-react";
import { api } from "../../api/client.js";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardBody } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import { useResource } from "../../hooks/useResource.js";
import { downloadFromApi } from "../../utils/download.js";
import { formatDate, formatDateTime, humanize, minutesToHours } from "../../utils/format.js";

const ACTIVE_STATUSES = ["present", "absent", "late", "half_day", "on_leave", "missing_checkout"];

export default function Attendance() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [confirm, setConfirm] = useState(null);
  const { loading: actionLoading, run } = useAsyncAction();
  const params = useMemo(() => ({ page, ...filters }), [page, filters]);
  const exportParams = useMemo(() => ({ ...filters }), [filters]);
  const { items, meta, loading, error, reload } = useResource("/attendance", params);
  const { items: employees } = useResource("/employees", { limit: 100 });

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee._id,
        label: `${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`,
      })),
    [employees],
  );

  const columns = useMemo(
    () => [
      { key: "date", label: "Date", render: (row) => formatDate(row.date) },
      { key: "employeeCode", label: "Employee ID", render: (row) => row.employee?.employeeCode || "-" },
      { key: "employee", label: "Employee", render: (row) => (row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : "-") },
      { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
      { key: "shift", label: "Shift", render: (row) => `${row.shiftStartTime || "-"} - ${row.shiftEndTime || "-"}` },
      { key: "checkInAt", label: "Check in", render: (row) => formatDateTime(row.checkInAt) },
      { key: "checkOutAt", label: "Check out", render: (row) => formatDateTime(row.checkOutAt) },
      { key: "durationMinutes", label: "Duration", render: (row) => minutesToHours(row.durationMinutes) },
      { key: "correction", label: "Correction", render: (row) => <Badge value={row.correctionRequest?.status || "none"} /> },
      {
        key: "actions",
        label: "Actions",
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            <Button
              icon={Check}
              variant="secondary"
              disabled={row.correctionRequest?.status !== "pending"}
              onClick={() => setConfirm({ action: "approve", row })}
            >
              Approve
            </Button>
            <Button
              icon={X}
              variant="danger"
              disabled={row.correctionRequest?.status !== "pending"}
              onClick={() => setConfirm({ action: "reject", row })}
            >
              Reject
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  function setFilter(name, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value || undefined }));
  }

  async function confirmAction() {
    const status = confirm.action === "approve" ? "approved" : "rejected";
    await run(
      () => api.patch(`/attendance/${confirm.row._id}/correction`, { status, note: `${status === "approved" ? "Approved" : "Rejected"} by admin` }),
      `Correction ${status}`,
    );
    setConfirm(null);
    reload();
  }

  async function downloadReport() {
    const suffix = [filters.from, filters.to].filter(Boolean).join("_to_");
    await run(
      () => downloadFromApi("/attendance/export", `attendance-report${suffix ? `-${suffix}` : ""}.xls`, exportParams),
      "Attendance report downloaded",
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">Attendance Management</h1>
        <Button icon={Download} variant="secondary" loading={actionLoading} loadingLabel="Downloading..." onClick={downloadReport}>
          Download Excel
        </Button>
      </div>

      <Card>
        <CardBody className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input label="From date" type="date" value={filters.from || ""} onChange={(event) => setFilter("from", event.target.value)} />
          <Input label="To date" type="date" value={filters.to || ""} onChange={(event) => setFilter("to", event.target.value)} />
          <Select
            label="Employee"
            value={filters.employee || ""}
            options={[{ label: "All employees", value: "" }, ...employeeOptions]}
            onChange={(event) => setFilter("employee", event.target.value)}
          />
          <Select
            label="Status"
            value={filters.status || ""}
            options={[{ label: "All statuses", value: "" }, ...ACTIVE_STATUSES.map((value) => ({ value, label: humanize(value) }))]}
            onChange={(event) => setFilter("status", event.target.value)}
          />
        </CardBody>
      </Card>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} onPage={setPage} emptyTitle="No attendance records found" />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.action === "approve" ? "Approve correction" : "Reject correction"}
        message="Please confirm this attendance correction action."
        confirmLabel={confirm?.action === "approve" ? "Approve" : "Reject"}
        loading={actionLoading}
        onCancel={() => setConfirm(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
}
