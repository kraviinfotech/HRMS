import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell.jsx";
import { ProtectedRoute } from "../components/layout/ProtectedRoute.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Login from "../pages/auth/Login.jsx";
import ActivateAccount from "../pages/auth/ActivateAccount.jsx";
import OtpVerification from "../pages/auth/OtpVerification.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import ChangePassword from "../pages/auth/ChangePassword.jsx";
import AccessDenied from "../pages/auth/AccessDenied.jsx";
import NotFound from "../pages/auth/NotFound.jsx";
import AdminDashboard from "../pages/admin/Dashboard.jsx";
import Employees from "../pages/admin/Employees.jsx";
import EmployeeDetails from "../pages/admin/EmployeeDetails.jsx";
import AdminAttendance from "../pages/admin/Attendance.jsx";
import AdminTimesheets from "../pages/admin/Timesheets.jsx";
import AdminTasks from "../pages/admin/Tasks.jsx";
import AdminLeaves from "../pages/admin/Leaves.jsx";
import AdminPayroll from "../pages/admin/Payroll.jsx";
import AdminTickets from "../pages/admin/Tickets.jsx";
import AdminAnnouncements from "../pages/admin/Announcements.jsx";
import Birthdays from "../pages/admin/Birthdays.jsx";
import Holidays from "../pages/admin/Holidays.jsx";
import AdminDocuments from "../pages/admin/Documents.jsx";
import Reports from "../pages/admin/Reports.jsx";
import Settings from "../pages/admin/Settings.jsx";
import AdminProfile from "../pages/admin/Profile.jsx";
import AuditLogs from "../pages/admin/AuditLogs.jsx";
import JoiningLetters from "../pages/admin/JoiningLetters.jsx";
import EmployeeDashboard from "../pages/employee/Dashboard.jsx";
import EmployeeProfile from "../pages/employee/Profile.jsx";
import EmployeeAttendance from "../pages/employee/Attendance.jsx";
import EmployeeTimesheets from "../pages/employee/Timesheets.jsx";
import EmployeeTasks from "../pages/employee/Tasks.jsx";
import EmployeeLeave from "../pages/employee/Leave.jsx";
import EmployeeSalary from "../pages/employee/Salary.jsx";
import EmployeeTickets from "../pages/employee/Tickets.jsx";
import EmployeeAnnouncements from "../pages/employee/Announcements.jsx";
import Notifications from "../pages/employee/Notifications.jsx";
import BirthdayCalendar from "../pages/employee/BirthdayCalendar.jsx";
import EmployeeDocuments from "../pages/employee/Documents.jsx";
import AccountSettings from "../pages/employee/AccountSettings.jsx";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/employee"} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<ActivateAccount />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<AppShell />}>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<EmployeeDetails />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="timesheets" element={<AdminTimesheets />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="leaves" element={<AdminLeaves />} />
          <Route path="payroll" element={<AdminPayroll />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="birthdays" element={<Birthdays />} />
          <Route path="holidays" element={<Holidays />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="joining-letters" element={<JoiningLetters />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["employee"]} />}>
        <Route path="/employee" element={<AppShell />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="timesheets" element={<EmployeeTimesheets />} />
          <Route path="tasks" element={<EmployeeTasks />} />
          <Route path="leave" element={<EmployeeLeave />} />
          <Route path="salary" element={<EmployeeSalary />} />
          <Route path="tickets" element={<EmployeeTickets />} />
          <Route path="announcements" element={<EmployeeAnnouncements />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="birthday-calendar" element={<BirthdayCalendar />} />
          <Route path="documents" element={<EmployeeDocuments />} />
          <Route path="account-settings" element={<AccountSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
