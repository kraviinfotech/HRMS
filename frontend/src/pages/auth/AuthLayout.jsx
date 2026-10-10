import { Link } from "react-router-dom";
import { useAppConfig } from "../../context/AppConfigContext.jsx";

export function AuthLayout({ title, children, footer }) {
  const { appName } = useAppConfig();

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="hidden flex-1 bg-brand-700 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <p className="text-2xl font-bold">Kravi Infotech</p>
          <p className="mt-2 text-brand-100">{appName}</p>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-semibold tracking-normal">Secure HR operations, clear employee workflows.</h1>
          <p className="mt-4 text-brand-100">Attendance, payroll, leave, tickets, documents, and approvals connected to one backend.</p>
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Link to="/" className="text-sm font-semibold text-brand-700 dark:text-brand-100">
            {appName}
          </Link>
          <h2 className="mt-6 text-2xl font-semibold tracking-normal">{title}</h2>
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-5 text-sm text-slate-600 dark:text-slate-300">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}
