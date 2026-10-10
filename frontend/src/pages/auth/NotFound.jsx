import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="max-w-md rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">The page you requested is unavailable.</p>
        <Link className="mt-5 inline-flex" to="/login">
          <Button>Go to sign in</Button>
        </Link>
      </div>
    </main>
  );
}
