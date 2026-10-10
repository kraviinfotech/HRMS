import { Download, Lock } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { ResourcePage } from "../../components/resource/ResourcePage.jsx";
import { formatMoney } from "../../utils/format.js";
import { downloadFromApi } from "../../utils/download.js";

const fields = [
  { name: "employee", label: "Employee ID", required: true },
  { name: "month", label: "Payroll month", type: "month", required: true },
  { name: "salaryStructure.basic", label: "Basic", type: "number", step: "0.01", required: true },
  { name: "salaryStructure.hra", label: "HRA", type: "number", step: "0.01" },
  { name: "salaryStructure.specialAllowance", label: "Special allowance", type: "number", step: "0.01" },
  { name: "salaryStructure.reimbursements", label: "Reimbursements", type: "number", step: "0.01" },
  { name: "unpaidLeaveDays", label: "Unpaid leave days", type: "number", step: "0.5" },
  { name: "effectiveDate", label: "Effective date", type: "date" },
];

export default function Payroll() {
  return (
    <ResourcePage
      title="Payroll Management"
      endpoint="/payroll"
      createEndpoint="/payroll/drafts"
      createLabel="Create draft"
      fields={fields}
      transformPayload={(payload) => ({
        ...payload,
        unpaidLeaveDays: payload.unpaidLeaveDays || 0,
      })}
      columns={[
        { key: "month", label: "Month" },
        { key: "employee", label: "Employee", render: (row) => row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : "-" },
        { key: "grossPay", label: "Gross", render: (row) => formatMoney(row.grossPay) },
        { key: "totalDeductions", label: "Deductions", render: (row) => formatMoney(row.totalDeductions) },
        { key: "netPay", label: "Net", render: (row) => formatMoney(row.netPay) },
        { key: "status", label: "Status", render: (row) => <Badge value={row.status} /> },
      ]}
      filters={[{ name: "status", label: "Status", options: ["draft", "approved", "finalized", "paid"].map((value) => ({ value, label: value })) }]}
      rowActions={[
        { label: "Finalize", icon: Lock, path: (row) => `/payroll/${row._id}/finalize`, body: {}, disabled: (row) => !["draft", "approved"].includes(row.status) },
        { label: "Payslip", icon: Download, run: downloadPayslip, success: "Payslip downloaded", disabled: (row) => !["finalized", "paid"].includes(row.status) },
      ]}
    />
  );
}

export async function downloadPayslip(row) {
  await downloadFromApi(`/payroll/${row._id}/payslip`, `payslip-${row.month}.pdf`);
}
