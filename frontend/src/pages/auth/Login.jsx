import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { FormError } from "../../components/ui/FormError.jsx";
import { AuthLayout } from "./AuthLayout.jsx";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { user, login, apiErrorMessage } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/employee"} replace />;
  }

  async function onSubmit(values) {
    try {
      const loggedIn = await login(values);
      toast.success("Logged in successfully");
      const fallback = loggedIn.role === "admin" ? "/admin" : "/employee";
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (error) {
      setError("root", { message: apiErrorMessage(error) });
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      footer={
        <div className="flex justify-between">
          <Link className="text-brand-700 dark:text-brand-100" to="/forgot-password">
            Forgot password
          </Link>
          <Link className="text-brand-700 dark:text-brand-100" to="/activate">
            Activate account
          </Link>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormError message={errors.root?.message} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        <Button className="w-full" type="submit" loading={isSubmitting} loadingLabel="Signing in...">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
