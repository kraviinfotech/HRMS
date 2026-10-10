import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { api, apiErrorMessage, unwrap } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { formatDate, formatDateTime, minutesToHours } from "../../utils/format.js";
import { useResource } from "../../hooks/useResource.js";

async function currentLocation() {
  if (!navigator.geolocation) return { label: "GPS unavailable" };
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          label: "Browser location",
        }),
      () => resolve({ label: "Location permission denied or unavailable" }),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}

export default function EmployeeAttendance() {
  const [today, setToday] = useState(null);
  const [busy, setBusy] = useState(false);
  const { items, loading, error, reload } = useResource("/attendance");
  const toast = useToast();

  async function loadToday() {
    try {
      setToday(unwrap(await api.get("/attendance/today")));
    } catch {
      setToday(null);
    }
  }

  useEffect(() => {
    loadToday();
  }, []);

  async function punch(path, success) {
    setBusy(true);
    try {
      const location = await currentLocation();
      const response = await api.post(path, { location });
      setToday(unwrap(response));
      toast.success(success);
      reload();
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">My Attendance</h1>
      <Card>
        <CardHeader title="Today" />
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge value={today?.status || "absent"} />
            <p className="text-sm text-slate-500">Duration: {minutesToHours(today?.durationMinutes)}</p>
            <p className="text-sm text-slate-500">Check in: {formatDateTime(today?.checkInAt)}</p>
            <p className="text-sm text-slate-500">Check out: {formatDateTime(today?.checkOutAt)}</p>
          </div>
          <div className="flex gap-2">
            <Button icon={LogIn} loading={busy} disabled={Boolean(today?.checkInAt)} onClick={() => punch("/attendance/check-in", "Checked in")}>Check in</Button>
            <Button icon={LogOut} variant="secondary" loading={busy} disabled={!today?.checkInAt || Boolean(today?.checkOutAt)} onClick={() => punch("/attendance/check-out", "Checked out")}>Check out</Button>
          </div>
        </CardBody>
      </Card>
      <DataTable
        columns={[
          { key: "date", label: "Date", render: (row) => formatDate(row.date) },
          { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
          { key: "checkInAt", label: "Check in", render: (row) => formatDateTime(row.checkInAt) },
          { key: "checkOutAt", label: "Check out", render: (row) => formatDateTime(row.checkOutAt) },
          { key: "durationMinutes", label: "Duration", render: (row) => minutesToHours(row.durationMinutes) },
        ]}
        rows={items}
        loading={loading}
        error={error}
      />
    </div>
  );
}
