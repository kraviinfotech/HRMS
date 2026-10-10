import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { api, apiErrorMessage } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { FormError } from "../../components/ui/FormError.jsx";
import { AuthLayout } from "./AuthLayout.jsx";

const schema = z.object({ email: z.string().email() });

export default function ForgotPassword() {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      await api.post("/auth/forgot-password", values);
      toast.success("Reset OTP request processed");
    } catch (error) {
      setError("root", { message: apiErrorMessage(error) });
    }
  }

  return (
    <AuthLayout title="Forgot password" footer={<Link to="/reset-password">I have a reset OTP</Link>}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormError message={errors.root?.message} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Button className="w-full" type="submit" loading={isSubmitting}>
          Send OTP
        </Button>
      </form>
    </AuthLayout>
  );
}
