import { minutesBetween } from "../utils/dates.js";

const REPORT_TIME_ZONE = "Asia/Kolkata";

export const ATTENDANCE_REPORT_COLUMNS = [
  { key: "date", label: "Date" },
  { key: "employeeId", label: "Employee Id" },
  { key: "employeeName", label: "Employee Name" },
  { key: "email", label: "Email ID" },
  { key: "checkIn", label: "Check-in" },
  { key: "checkInSource", label: "Check-in Source" },
  { key: "checkOut", label: "Check-out" },
  { key: "checkOutSource", label: "Check-out Source" },
  { key: "earlyEntry", label: "Early Entry" },
  { key: "lateEntry", label: "Late Entry" },
  { key: "earlyExit", label: "Early Exit" },
  { key: "lateExit", label: "Late Exit" },
  { key: "checkInLocation", label: "Check-in Location" },
  { key: "checkOutLocation", label: "Check-out Location" },
  { key: "totalHours", label: "Total Hours" },
  { key: "payableHours", label: "Payable Hours" },
  { key: "status", label: "Status" },
  { key: "officeInHours", label: "Office In Hours" },
  { key: "remoteInHours", label: "Remote In Hours" },
  { key: "officeRemote", label: "Office In/Remote In" },
  { key: "coreExpected", label: "Core Hours Expected" },
  { key: "coreWorked", label: "Core Hours Worked" },
  { key: "coreDeviation", label: "Core Hours Deviation" },
  { key: "shifts", label: "Shift(s)" },
  { key: "shiftAllowance", label: "Shift Allowance" },
  { key: "totalShiftAllowance", label: "Total Shift Allowance" },
  { key: "timeZone", label: "Time zone" },
];

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: REPORT_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  timeZone: REPORT_TIME_ZONE,
});

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatReportDate(value) {
  if (!value) return "-";
  return dateFormatter.format(new Date(value)).replaceAll(" ", "-");
}

function formatReportTime(value) {
  if (!value) return "-";
  return timeFormatter.format(new Date(value));
}

function formatDuration(minutes) {
  if (!Number.isFinite(Number(minutes))) return "-";
  const total = Math.max(Math.round(Number(minutes)), 0);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function formatDelta(minutes) {
  const value = Math.round(Number(minutes || 0));
  return value > 0 ? formatDuration(value) : "-";
}

function formatSignedDuration(minutes) {
  const value = Math.round(Number(minutes || 0));
  if (value === 0) return "00:00";
  return `${value > 0 ? "+" : "-"}${formatDuration(Math.abs(value))}`;
}

function timeOnDate(date, time) {
  const [hours, minutes] = String(time || "00:00").split(":").map(Number);
  const value = new Date(date);
  value.setHours(hours, minutes, 0, 0);
  return value;
}

function shiftWindow(attendance) {
  const start = timeOnDate(attendance.date, attendance.shiftStartTime || "09:00");
  const end = timeOnDate(attendance.date, attendance.shiftEndTime || "18:00");
  if (end <= start) end.setDate(end.getDate() + 1);
  return { start, end, expectedMinutes: minutesBetween(start, end) };
}

function firstPunch(attendance, type) {
  return (attendance.punches || []).find((punch) => punch.type === type);
}

function lastPunch(attendance, type) {
  return [...(attendance.punches || [])].reverse().find((punch) => punch.type === type);
}

function locationValue(punch) {
  const location = punch?.location;
  if (!location) return "-";

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  return location.label || "-";
}

function statusLabel(status) {
  const labels = {
    absent: "Absent",
    half_day: "0.5 day Present, 0.5 day Absent",
    late: "Late",
    missing_checkout: "Missing Checkout",
    on_leave: "On Leave",
    present: "Present",
  };
  return labels[status] || String(status || "-").replaceAll("_", " ");
}

export function buildAttendanceReportRows(attendances) {
  return attendances.map((attendance) => {
    const employee = attendance.employee || {};
    const checkInPunch = firstPunch(attendance, "check_in");
    const checkOutPunch = lastPunch(attendance, "check_out");
    const checkInAt = attendance.checkInAt ? new Date(attendance.checkInAt) : null;
    const checkOutAt = attendance.checkOutAt ? new Date(attendance.checkOutAt) : null;
    const { start, end, expectedMinutes } = shiftWindow(attendance);
    const totalMinutes = Number(attendance.durationMinutes || 0);

    const earlyEntry = checkInAt && checkInAt < start ? minutesBetween(checkInAt, start) : 0;
    const lateEntry = checkInAt && checkInAt > start ? minutesBetween(start, checkInAt) : 0;
    const earlyExit = checkOutAt && checkOutAt < end ? minutesBetween(checkOutAt, end) : 0;
    const lateExit = checkOutAt && checkOutAt > end ? minutesBetween(end, checkOutAt) : 0;

    return {
      date: formatReportDate(attendance.date),
      employeeId: employee.employeeCode || "-",
      employeeName: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "-",
      email: employee.email || "-",
      checkIn: formatReportTime(attendance.checkInAt),
      checkInSource: checkInPunch ? "Web" : "-",
      checkOut: formatReportTime(attendance.checkOutAt),
      checkOutSource: checkOutPunch ? "Web" : "-",
      earlyEntry: formatDelta(earlyEntry),
      lateEntry: formatDelta(lateEntry),
      earlyExit: formatDelta(earlyExit),
      lateExit: formatDelta(lateExit),
      checkInLocation: locationValue(checkInPunch),
      checkOutLocation: locationValue(checkOutPunch),
      totalHours: formatDuration(totalMinutes),
      payableHours: formatDuration(totalMinutes),
      status: statusLabel(attendance.status),
      officeInHours: "-",
      remoteInHours: totalMinutes > 0 ? formatDuration(totalMinutes) : "-",
      officeRemote: totalMinutes > 0 ? "Remote In" : "-",
      coreExpected: formatDuration(expectedMinutes),
      coreWorked: formatDuration(totalMinutes),
      coreDeviation: formatSignedDuration(totalMinutes - expectedMinutes),
      shifts: `${attendance.shiftStartTime || "09:00"} - ${attendance.shiftEndTime || "18:00"}`,
      shiftAllowance: "-",
      totalShiftAllowance: "-",
      timeZone: REPORT_TIME_ZONE,
    };
  });
}

export function buildAttendanceReportWorkbook(rows) {
  const headerCells = ATTENDANCE_REPORT_COLUMNS.map(
    (column) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(column.label)}</Data></Cell>`,
  ).join("");
  const bodyRows = rows
    .map((row) => {
      const cells = ATTENDANCE_REPORT_COLUMNS.map(
        (column) => `<Cell><Data ss:Type="String">${escapeXml(row[column.key])}</Data></Cell>`,
      ).join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#D9EAF7" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Attendance Report">
    <Table>
      <Row>${headerCells}</Row>
      ${bodyRows}
    </Table>
  </Worksheet>
</Workbook>`;
}
