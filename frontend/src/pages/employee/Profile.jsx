import { useAuth } from "../../context/AuthContext.jsx";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { formatDate } from "../../utils/format.js";

export default function EmployeeProfile() {
  const { user } = useAuth();
  const employee = user.employee;
  const details = [
    ["Employee ID", employee?.employeeCode],
    ["Email", user.email],
    ["Department", employee?.department],
    ["Designation", employee?.designation],
    ["Joining Date", formatDate(employee?.joiningDate)],
    ["Phone", employee?.phone],
  ];

  return (
    <Card>
      <CardHeader title="Employee Profile" />
      <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {details.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs uppercase text-slate-500">{label}</p>
            <p className="mt-1 font-medium">{value || "-"}</p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
