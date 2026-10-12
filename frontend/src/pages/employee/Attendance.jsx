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

const ACTIVE_ATTENDANCE_WINDOW_MS = 24 * 60 * 60 * 1000;

async function currentLocation() {
  if (!navigator.geolocation) {
    throw new Error("Location permission is required for attendance.");
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          label: "Browser location",
        }),
      () => resolve(null),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 },
    );
  }).then((location) => {
    if (!Number.isFinite(location?.latitude) || !Number.isFinite(location?.longitude)) {
      throw new Error("Please allow location access before marking attendance.");
    }
    return location;
  });
}

function latestPunch(attendance) {
  const punches = attendance?.punches || [];
  return punches[punches.length - 1] || null;
}

function activeSession(attendance) {
  const punch = latestPunch(attendance);
  if (punch?.type !== "check_in" || !punch.at) return null;

  const startedAt = new Date(punch.at).getTime();
  return Date.now() - startedAt < ACTIVE_ATTENDANCE_WINDOW_MS ? punch : null;
}

export default function EmployeeAttendance() {
  const [today, setToday] = useState(null);
  const [busy, setBusy] = useState(false);
  const { items, loading, error, reload } = useResource("/attendance");
  const toast = useToast();
  const currentSession = activeSession(today);

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

  async function punch() {
    setBusy(true);
    try {
      const location = await currentLocation();
      const checkingOut = Boolean(currentSession);
      const path = checkingOut ? "/attendance/check-out" : "/attendance/check-in";
      const response = await api.post(path, { location });
      setToday(unwrap(response));
      toast.success(checkingOut ? "Checked out" : "Checked in");
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
            <p className="text-sm text-slate-500">Shift: {today?.shiftStartTime || "-"} - {today?.shiftEndTime || "-"}</p>
            <p className="text-sm text-slate-500">Duration: {minutesToHours(today?.durationMinutes)}</p>
            <p className="text-sm text-slate-500">Check in: {formatDateTime(currentSession?.at || today?.checkInAt)}</p>
            <p className="text-sm text-slate-500">Check out: {formatDateTime(today?.checkOutAt)}</p>
          </div>
          <div className="flex gap-2">
            <Button icon={currentSession ? LogOut : LogIn} variant={currentSession ? "secondary" : "primary"} loading={busy} onClick={punch}>
              {currentSession ? "Check out" : "Check in"}
            </Button>
          </div>
        </CardBody>
      </Card>
      <DataTable
        columns={[
          { key: "date", label: "Date", render: (row) => formatDate(row.date) },
          { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
          { key: "shift", label: "Shift", render: (row) => `${row.shiftStartTime || "-"} - ${row.shiftEndTime || "-"}` },
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
