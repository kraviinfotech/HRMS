import { NavLink } from "react-router-dom";
import {
  Bell,
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  FileArchive,
  FileText,
  Gauge,
  Gift,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  ScrollText,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useAppConfig } from "../../context/AppConfigContext.jsx";

const adminItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/admin/timesheets", label: "Timesheets", icon: CalendarDays },
  { to: "/admin/leaves", label: "Leaves", icon: Briefcase },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/birthdays", label: "Birthdays", icon: Gift },
  { to: "/admin/reports", label: "Reports", icon: Gauge },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
  { to: "/admin/holidays", label: "Holidays", icon: CalendarDays },
  { to: "/admin/tasks", label: "Tasks", icon: ListTodo },
  { to: "/admin/payroll", label: "Payroll", icon: Landmark },
  { to: "/admin/tickets", label: "Tickets", icon: HelpCircle },
  { to: "/admin/joining-letters", label: "Letters", icon: FileText },
  { to: "/admin/documents", label: "Documents", icon: FileArchive },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/profile", label: "Profile", icon: UserRound },
];

const employeeItems = [
  { to: "/employee", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/employee/profile", label: "Profile", icon: UserRound },
  { to: "/employee/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/employee/timesheets", label: "Timesheets", icon: CalendarDays },
  { to: "/employee/tasks", label: "Tasks", icon: ListTodo },
  { to: "/employee/leave", label: "Leave", icon: Briefcase },
  { to: "/employee/salary", label: "Salary", icon: Landmark },
  { to: "/employee/tickets", label: "Tickets", icon: HelpCircle },
  { to: "/employee/announcements", label: "Announcements", icon: Megaphone },
  { to: "/employee/notifications", label: "Notifications", icon: Bell },
  { to: "/employee/birthday-calendar", label: "Birthdays", icon: Gift },
  { to: "/employee/documents", label: "Documents", icon: ScrollText },
  { to: "/employee/account-settings", label: "Account", icon: Settings },
];

export function Sidebar({ role, open, onClose }) {
  const items = role === "admin" ? adminItems : employeeItems;
  const { appName } = useAppConfig();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800">
        <div>
          <p className="text-lg font-bold text-brand-700 dark:text-brand-100">Kravi Infotech</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">{appName}</p>
        </div>
      </div>
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
