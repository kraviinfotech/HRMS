import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";

export default function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="max-w-md rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-600" />
        <h1 className="mt-4 text-2xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Your account does not have access to this area.</p>
        <Link className="mt-5 inline-flex" to="/login">
          <Button>Return to sign in</Button>
        </Link>
      </div>
    </main>
  );
}
