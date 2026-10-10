import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import { Employee } from "../models/Employee.js";
import { Payroll } from "../models/Payroll.js";
import { env } from "../config/env.js";
import { assertOrThrow } from "../utils/httpError.js";
import { sumMoney, toMoney } from "../utils/money.js";
import { getPagination, paginate } from "../utils/pagination.js";
import { getCompanySettings } from "./settingsService.js";

export function calculateIndianPayroll({ salaryStructure, rules, unpaidLeaveDays = 0 }) {
  const basic = toMoney(salaryStructure.basic);
  const hra = toMoney(salaryStructure.hra);
  const specialAllowance = toMoney(salaryStructure.specialAllowance);
  const reimbursements = toMoney(salaryStructure.reimbursements);
  const grossBeforeLoss = sumMoney([basic, hra, specialAllowance, reimbursements]);
  const dailyRate = toMoney(grossBeforeLoss / 30);
  const lossOfPay = toMoney(dailyRate * unpaidLeaveDays);
  const grossPay = toMoney(Math.max(grossBeforeLoss - lossOfPay, 0));

  const earnings = [
    { label: "Basic", amount: basic },
    { label: "HRA", amount: hra },
    { label: "Special Allowance", amount: specialAllowance },
    { label: "Reimbursements", amount: reimbursements },
  ].filter((line) => line.amount > 0);

  if (lossOfPay > 0) {
    earnings.push({ label: "Loss of pay adjustment", amount: -lossOfPay });
  }

  const deductions = [];
  const pfRule = rules?.pf;
  if (pfRule?.enabled) {
    const pfAmount = toMoney(basic * Number(pfRule.rate || 0));
    deductions.push({ label: "PF", amount: toMoney(pfRule.cap ? Math.min(pfAmount, pfRule.cap) : pfAmount) });
  }

  const esiRule = rules?.esi;
  if (esiRule?.enabled && (!esiRule.threshold || grossPay <= esiRule.threshold)) {
    deductions.push({ label: "ESI", amount: toMoney(grossPay * Number(esiRule.rate || 0)) });
  }

  const ptRule = rules?.professionalTax;
  if (ptRule?.enabled && grossPay >= Number(ptRule.threshold || 0)) {
    deductions.push({ label: "Professional Tax", amount: toMoney(ptRule.rate || 0) });
  }

  const tdsRule = rules?.tds;
  if (tdsRule?.enabled && grossPay >= Number(tdsRule.threshold || 0)) {
    deductions.push({ label: "TDS", amount: toMoney(grossPay * Number(tdsRule.rate || 0)) });
  }

  const totalDeductions = sumMoney(deductions.map((deduction) => deduction.amount));
  const netPay = toMoney(grossPay - totalDeductions);

  return { earnings, deductions, grossPay, totalDeductions, netPay };
}

export async function createPayrollDraft({ payload }) {
  const employee = await Employee.findById(payload.employee);
  assertOrThrow(employee, 404, "Employee not found");
  const settings = await getCompanySettings();
  const calculation = calculateIndianPayroll({
    salaryStructure: payload.salaryStructure,
    rules: settings.payrollRules,
    unpaidLeaveDays: payload.unpaidLeaveDays || 0,
  });

  return Payroll.findOneAndUpdate(
    { employee: employee._id, month: payload.month },
    {
      $set: {
        employee: employee._id,
        month: payload.month,
        status: "draft",
        salaryStructure: payload.salaryStructure,
        unpaidLeaveDays: payload.unpaidLeaveDays || 0,
        earnings: calculation.earnings,
        deductions: calculation.deductions,
        grossPay: calculation.grossPay,
        totalDeductions: calculation.totalDeductions,
        netPay: calculation.netPay,
        effectiveDate: payload.effectiveDate || new Date(),
      },
    },
    { new: true, upsert: true, runValidators: true },
  ).populate("employee", "firstName lastName employeeCode department");
}

export async function listPayroll({ user, query }) {
  const { page, limit, skip } = getPagination(query);
  const filters = {};
  if (user.role === "employee") filters.employee = user.employee._id;
  if (user.role === "admin" && query.employee) filters.employee = query.employee;
  if (query.month) filters.month = query.month;
  if (query.status) filters.status = query.status;

  return paginate(
    Payroll.find(filters).populate("employee", "firstName lastName employeeCode department").sort({ month: -1 }).skip(skip).limit(limit),
    Payroll.countDocuments(filters),
    { page, limit },
  );
}

export async function finalizePayroll({ admin, id }) {
  const payroll = await Payroll.findById(id).populate("employee", "firstName lastName employeeCode");
  assertOrThrow(payroll, 404, "Payroll record not found");
  assertOrThrow(["draft", "approved"].includes(payroll.status), 409, "Only draft or approved payroll can be finalized");

  payroll.status = "finalized";
  payroll.finalizedBy = admin._id;
  payroll.finalizedAt = new Date();
  await payroll.save();
  return payroll;
}

export async function getAuthorizedPayroll({ user, id }) {
  const payroll = await Payroll.findById(id).populate("employee", "firstName lastName employeeCode department designation");
  assertOrThrow(payroll, 404, "Payroll record not found");
  if (user.role !== "admin") {
    assertOrThrow(payroll.employee._id.toString() === user.employee._id.toString(), 403, "You can only access your own payroll records");
    assertOrThrow(["finalized", "paid"].includes(payroll.status), 403, "Payroll is not released yet");
  }
  return payroll;
}

export async function generatePayslip({ user, id }) {
  const payroll = await getAuthorizedPayroll({ user, id });
  await fsp.mkdir(env.PAYSLIP_DIR, { recursive: true });
  const filename = `payslip-${payroll.employee.employeeCode}-${payroll.month}.pdf`;
  const filePath = path.join(env.PAYSLIP_DIR, filename);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const stream = fs.createWriteStream(filePath);
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.pipe(stream);
    doc.fontSize(18).text("Kravi Infotech Payslip", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).text(`Employee: ${payroll.employee.firstName} ${payroll.employee.lastName}`);
    doc.text(`Employee ID: ${payroll.employee.employeeCode}`);
    doc.text(`Month: ${payroll.month}`);
    doc.text(`Status: ${payroll.status}`);
    doc.moveDown();
    doc.fontSize(13).text("Earnings");
    payroll.earnings.forEach((line) => doc.fontSize(11).text(`${line.label}: INR ${line.amount.toFixed(2)}`));
    doc.moveDown();
    doc.fontSize(13).text("Deductions");
    payroll.deductions.forEach((line) => doc.fontSize(11).text(`${line.label}: INR ${line.amount.toFixed(2)}`));
    doc.moveDown();
    doc.fontSize(12).text(`Gross Pay: INR ${payroll.grossPay.toFixed(2)}`);
    doc.text(`Total Deductions: INR ${payroll.totalDeductions.toFixed(2)}`);
    doc.fontSize(14).text(`Net Pay: INR ${payroll.netPay.toFixed(2)}`);
    doc.moveDown();
    doc.fontSize(9).text(payroll.assumptions);
    doc.end();
  });

  payroll.payslipPath = filePath;
  await payroll.save();
  return { payroll, filePath, filename };
}
