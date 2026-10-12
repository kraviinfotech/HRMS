import { Download, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatDate } from "../../utils/format.js";
import { downloadFromApi } from "../../utils/download.js";

const fields = [
  { name: "firstName", label: "First name", required: true },
  { name: "lastName", label: "Last name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "password",
    label: "Initial password",
    type: "password",
    required: true,
    autoComplete: "new-password",
    minLength: 10,
    placeholder: "Minimum 10 characters",
    validation: {
      minLength: { value: 10, message: "Password must be at least 10 characters" },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        message: "Password must include uppercase, lowercase, and a number",
      },
    },
  },
  { name: "phone", label: "Phone" },
  { name: "department", label: "Department", required: true },
  { name: "designation", label: "Designation", required: true },
  { name: "shiftStartTime", label: "Shift from", type: "time", required: true, defaultValue: "09:00" },
  { name: "shiftEndTime", label: "Shift to", type: "time", required: true, defaultValue: "18:00" },
  { name: "joiningDate", label: "Joining date", type: "date", required: true },
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
  { name: "address", label: "Address", type: "textarea" },
];

export default function Employees() {
  return (
    <ResourcePage
      title="Employee Management"
      endpoint="/employees"
      createLabel="Add employee"
      fields={fields}
      columns={[
        { key: "employeeCode", label: "Employee ID" },
        {
          key: "name",
          label: "Name",
          render: (row) => <Link className="font-medium text-brand-700" to={`/admin/employees/${row._id}`}>{`${row.firstName} ${row.lastName}`}</Link>,
        },
        { key: "email", label: "Email" },
        { key: "department", label: "Department" },
        { key: "designation", label: "Designation" },
        { key: "shift", label: "Shift", render: (row) => `${row.shiftStartTime || "09:00"} - ${row.shiftEndTime || "18:00"}` },
        { key: "joiningDate", label: "Joined", render: (row) => formatDate(row.joiningDate) },
        { key: "employmentStatus", label: "Status", render: (row) => <Badge value={row.employmentStatus} /> },
      ]}
      filters={[
        {
          name: "employmentStatus",
          label: "Status",
          options: ["active", "probation", "notice", "exited", "inactive"].map((value) => ({ value, label: value })),
        },
      ]}
      rowActions={[
        {
          label: "Deactivate",
          icon: PauseCircle,
          path: (row) => `/employees/${row._id}/status`,
          body: { status: "inactive" },
          disabled: (row) => row.employmentStatus === "inactive",
          confirmMessage: "Deactivate this employee account?",
        },
        {
          label: "Reactivate",
          icon: PlayCircle,
          path: (row) => `/employees/${row._id}/status`,
          body: { status: "active" },
          disabled: (row) => row.employmentStatus === "active",
          confirmMessage: "Reactivate this employee account?",
        },
        {
          label: "Delete",
          icon: Trash2,
          variant: "danger",
          method: "delete",
          path: (row) => `/employees/${row._id}`,
          confirmTitle: "Delete employee?",
          confirmMessage: "This will permanently delete this employee, login account, attendance, leave, payroll, timesheet, task, ticket, document, session, notification, and OTP records. This cannot be undone.",
          success: "Employee deleted",
        },
      ]}
      emptyTitle="No employees found"
    />
  );
}

export function EmployeeExportButton() {
  return (
    <Button icon={Download} variant="secondary" onClick={() => downloadFromApi("/employees/export", "employees.csv")}>
      Export
    </Button>
  );
}
