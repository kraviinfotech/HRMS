import { useResource } from "../../hooks/useResource.js";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { formatDate } from "../../utils/format.js";

export default function Birthdays() {
  const { items, loading, error } = useResource("/admin/birthdays");
  return (
    <Card>
      <CardHeader title="Birthday Management" />
      <CardBody>
        <DataTable
          columns={[
            { key: "name", label: "Employee", render: (row) => `${row.firstName} ${row.lastName}` },
            { key: "department", label: "Department" },
            { key: "dateOfBirth", label: "Birthday", render: (row) => formatDate(row.dateOfBirth) },
          ]}
          rows={items}
          loading={loading}
          error={error}
          emptyTitle="No birthdays recorded"
        />
      </CardBody>
    </Card>
  );
}
