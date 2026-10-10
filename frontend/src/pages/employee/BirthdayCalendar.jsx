import { useResource } from "../../hooks/useResource.js";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { formatDate } from "../../utils/format.js";

export default function BirthdayCalendar() {
  const { items, loading, error } = useResource("/admin/birthdays");
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Birthday Calendar</h1>
      <DataTable
        columns={[
          { key: "name", label: "Employee", render: (row) => `${row.firstName} ${row.lastName}` },
          { key: "department", label: "Department" },
          { key: "dateOfBirth", label: "Birthday", render: (row) => formatDate(row.dateOfBirth) },
        ]}
        rows={items}
        loading={loading}
        error={error}
      />
    </div>
  );
}
