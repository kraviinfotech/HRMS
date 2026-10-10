import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, apiErrorMessage, unwrap } from "../../api/client.js";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { formatMoney, humanize } from "../../utils/format.js";

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/reports")
      .then((response) => setData(unwrap(response)))
      .catch((requestError) => setError(apiErrorMessage(requestError)));
  }, []);

  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!data) return <Spinner />;

  const counts = ["employees", "attendance", "tasks", "timesheets", "leaves", "tickets"].map((key) => ({
    name: humanize(key),
    value: data[key],
  }));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Reports and Exports</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map((item) => (
          <Card key={item.name}>
            <CardBody>
              <p className="text-sm text-slate-500">{item.name}</p>
              <p className="mt-2 text-2xl font-semibold">{item.value || 0}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title="Operational Volume" />
        <CardBody className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={counts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Payroll Summary" />
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.payroll.map((row) => (
            <div key={row._id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm text-slate-500">{humanize(row._id)}</p>
              <p className="mt-2 text-lg font-semibold">{formatMoney(row.total)}</p>
              <p className="text-xs text-slate-500">{row.count} records</p>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
