import { Download } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatMoney } from "../../utils/format.js";
import { downloadFromApi } from "../../utils/download.js";

export default function EmployeeSalary() {
  return (
    <ResourcePage
      title="My Salary"
      endpoint="/payroll"
      columns={[
        { key: "month", label: "Month" },
        { key: "grossPay", label: "Gross", render: (row) => formatMoney(row.grossPay) },
        { key: "totalDeductions", label: "Deductions", render: (row) => formatMoney(row.totalDeductions) },
        { key: "netPay", label: "Net", render: (row) => formatMoney(row.netPay) },
        { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
      ]}
      rowActions={[
        {
          label: "Payslip",
          icon: Download,
          run: (row) => downloadFromApi(`/payroll/${row._id}/payslip`, `payslip-${row.month}.pdf`),
          success: "Payslip downloaded",
          disabled: (row) => !["finalized", "paid"].includes(row.status),
        },
      ]}
    />
  );
}
