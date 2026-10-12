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
const DEFAULT_SHIFT_START = "09:00";
const DEFAULT_SHIFT_END = "18:00";

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

function activeSession(attendance, nowMs = Date.now()) {
  const punch = latestPunch(attendance);
  if (punch?.type !== "check_in" || !punch.at) return null;

  const startedAt = new Date(punch.at).getTime();
  return nowMs - startedAt < ACTIVE_ATTENDANCE_WINDOW_MS ? punch : null;
}

function timeOnAttendanceDate(attendance, time) {
  const [hours, minutes] = String(time).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const value = new Date(attendance?.date || attendance?.checkInAt || Date.now());
  value.setHours(hours, minutes, 0, 0);
  return value;
}

function shiftDurationMs(attendance) {
  const shiftStart = timeOnAttendanceDate(attendance, attendance?.shiftStartTime || DEFAULT_SHIFT_START);
  const shiftEnd = timeOnAttendanceDate(attendance, attendance?.shiftEndTime || DEFAULT_SHIFT_END);

  if (!shiftStart || !shiftEnd) return 0;
  if (shiftEnd <= shiftStart) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  return shiftEnd.getTime() - shiftStart.getTime();
}

function completedPunchDurationMs(attendance) {
  const punches = attendance?.punches || [];
  if (!punches.length) return Number(attendance?.durationMinutes || 0) * 60 * 1000;

  let openPunchAt = null;
  let totalMs = 0;

  for (const punch of punches) {
    if (punch.type === "check_in") {
      const checkInAt = new Date(punch.at).getTime();
      openPunchAt = Number.isFinite(checkInAt) ? checkInAt : null;
    } else if (punch.type === "check_out" && openPunchAt) {
      const checkOutAt = new Date(punch.at).getTime();
      if (Number.isFinite(checkOutAt) && checkOutAt > openPunchAt) {
        totalMs += checkOutAt - openPunchAt;
      }
      openPunchAt = null;
    }
  }

  return totalMs;
}

function workedDurationMs(attendance, currentSession, nowMs) {
  const completedMs = completedPunchDurationMs(attendance);
  const startedAt = currentSession?.at ? new Date(currentSession.at).getTime() : null;

  if (!Number.isFinite(startedAt)) return completedMs;
  return completedMs + Math.max(nowMs - startedAt, 0);
}

function durationClock(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function EmployeeAttendance() {
  const [today, setToday] = useState(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const { items, loading, error, reload } = useResource("/attendance");
  const toast = useToast();
  const currentSession = activeSession(today, now);
  const workedMs = workedDurationMs(today, currentSession, now);
  const scheduledShiftMs = shiftDurationMs(today);
  const hasWorkedToday = Boolean(today);
  const hasReachedShiftTime = scheduledShiftMs > 0 && workedMs >= scheduledShiftMs;

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

  useEffect(() => {
    if (!currentSession) return undefined;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [currentSession?.at]);

  async function punch() {
    setBusy(true);
    try {
      const location = await currentLocation();
      const checkingOut = Boolean(currentSession);
      const path = checkingOut ? "/attendance/check-out" : "/attendance/check-in";
      const response = await api.post(path, { location });
      setToday(unwrap(response));
      setNow(Date.now());
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
          <div className="flex flex-col gap-3 sm:items-end">
            {hasWorkedToday && (
              <div className="min-w-40 rounded-md border border-brand-100 bg-brand-50 px-4 py-3 text-right dark:border-brand-500/20 dark:bg-brand-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100">
                  {currentSession ? "Worked time" : "Paused time"}
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-brand-900 dark:text-white">
                  {durationClock(workedMs)}
                </p>
                {scheduledShiftMs > 0 && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                    {hasReachedShiftTime ? "Shift time reached" : `Shift time: ${durationClock(scheduledShiftMs)}`}
                  </p>
                )}
              </div>
            )}
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
