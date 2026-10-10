import { Bell, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { Button } from "../ui/Button.jsx";

export function Header({ onMenu }) {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" icon={Menu} className="lg:hidden" onClick={onMenu} aria-label="Open navigation" />
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">{user?.name}</p>
          <p className="text-xs capitalize text-slate-500">{user?.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          icon={Bell}
          onClick={() => navigate(user?.role === "employee" ? "/employee/notifications" : "/admin/announcements")}
          aria-label="Notifications"
        />
        <Button variant="ghost" icon={dark ? Sun : Moon} onClick={toggleTheme} aria-label="Toggle theme" />
        <Button variant="secondary" icon={LogOut} onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
