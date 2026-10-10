import { useEffect, useState } from "react";
import { api, apiErrorMessage, unwrap } from "../../api/client.js";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { formatDate, minutesToHours } from "../../utils/format.js";

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/employee")
      .then((response) => setData(unwrap(response)))
      .catch((requestError) => setError(apiErrorMessage(requestError)));
  }, []);

  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!data) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Welcome, {data.employee.firstName}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Today</p>
            <div className="mt-2"><Badge value={data.attendance?.status || "absent"} /></div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Working Hours</p>
            <p className="mt-2 text-2xl font-semibold">{minutesToHours(data.attendance?.durationMinutes)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Active Tasks</p>
            <p className="mt-2 text-2xl font-semibold">{data.tasks.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Recent Tickets</p>
            <p className="mt-2 text-2xl font-semibold">{data.tickets.length}</p>
          </CardBody>
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Assigned Tasks" />
          <CardBody className="space-y-3">
            {data.tasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-slate-500">{formatDate(task.deadline)}</p>
                </div>
                <Badge value={task.status} />
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Leave and Payroll" />
          <CardBody className="space-y-3">
            {data.leaves.map((leave) => (
              <div key={leave._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                <span>{leave.type} - {formatDate(leave.startDate)}</span>
                <Badge value={leave.status} />
              </div>
            ))}
            {data.payroll.map((payroll) => (
              <div key={payroll._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                <span>{payroll.month}</span>
                <Badge value={payroll.status} />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
