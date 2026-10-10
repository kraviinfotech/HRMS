import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api, apiErrorMessage } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { FormError } from "../../components/ui/FormError.jsx";
import { AuthLayout } from "./AuthLayout.jsx";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "Enter the 6 digit OTP"),
  password: z.string().min(10).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
});

export default function ActivateAccount() {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      await api.post("/auth/activate", values);
      toast.success("Account activated");
      navigate("/login");
    } catch (error) {
      setError("root", { message: apiErrorMessage(error) });
    }
  }

  return (
    <AuthLayout title="Activate account" footer={<Link to="/login">Back to sign in</Link>}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormError message={errors.root?.message} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Activation OTP" inputMode="numeric" error={errors.otp?.message} {...register("otp")} />
        <Input label="New password" type="password" error={errors.password?.message} {...register("password")} />
        <Button className="w-full" type="submit" loading={isSubmitting}>
          Activate
        </Button>
      </form>
    </AuthLayout>
  );
}
