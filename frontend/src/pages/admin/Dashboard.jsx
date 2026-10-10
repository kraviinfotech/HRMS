import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, apiErrorMessage, unwrap } from "../../api/client.js";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/admin")
      .then((response) => setData(unwrap(response)))
      .catch((requestError) => setError(apiErrorMessage(requestError)));
  }, []);

  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!data) return <Spinner />;

  const stats = [
    ["Active Employees", data.activeEmployees],
    ["Pending Timesheets", data.pendingTimesheets],
    ["Pending Leaves", data.pendingLeaves],
    ["Open Tickets", data.openTickets],
    ["Open Tasks", data.openTasks],
    ["Payroll Drafts", data.payrollDrafts],
  ];

  const attendanceChart = Object.entries(data.attendance || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-normal">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <CardBody>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value || 0}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Attendance Today" />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceChart} dataKey="value" nameKey="name" outerRadius={92} fill="#2563eb" label />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Work Queue" />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.slice(1).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
