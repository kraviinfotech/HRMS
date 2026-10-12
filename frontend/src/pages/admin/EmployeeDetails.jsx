import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, apiErrorMessage, unwrap } from "../../api/client.js";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { formatDate } from "../../utils/format.js";

export default function EmployeeDetails() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/employees/${id}`)
      .then((response) => setEmployee(unwrap(response)))
      .catch((requestError) => setError(apiErrorMessage(requestError)));
  }, [id]);

  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!employee) return <Spinner />;

  const details = [
    ["Employee ID", employee.employeeCode],
    ["Email", employee.email],
    ["Phone", employee.phone],
    ["Department", employee.department],
    ["Designation", employee.designation],
    ["Shift", `${employee.shiftStartTime || "09:00"} - ${employee.shiftEndTime || "18:00"}`],
    ["Joining Date", formatDate(employee.joiningDate)],
    ["Date of Birth", formatDate(employee.dateOfBirth)],
    ["Reporting Manager", employee.reportingManager ? `${employee.reportingManager.firstName} ${employee.reportingManager.lastName}` : "-"],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{employee.firstName} {employee.lastName}</h1>
        <Badge value={employee.employmentStatus} />
      </div>
      <Card>
        <CardHeader title="Employee Details" />
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs uppercase text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-medium">{value || "-"}</p>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
