import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { Header } from "./Header.jsx";
import { Breadcrumbs } from "./Breadcrumbs.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex">
        <Sidebar role={user?.role} open={navOpen} onClose={() => setNavOpen(false)} />
        {navOpen ? <button className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden" type="button" onClick={() => setNavOpen(false)} aria-label="Close navigation" /> : null}
        <div className="min-w-0 flex-1">
          <Header onMenu={() => setNavOpen(true)} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
            <Breadcrumbs />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
