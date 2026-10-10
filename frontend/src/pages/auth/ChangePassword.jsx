import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api, apiErrorMessage } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { FormError } from "../../components/ui/FormError.jsx";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
});

export default function ChangePassword() {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      await api.post("/auth/change-password", values);
      toast.success("Password changed");
      reset();
    } catch (error) {
      setError("root", { message: apiErrorMessage(error) });
    }
  }

  return (
    <Card>
      <CardHeader title="Change password" />
      <CardBody>
        <form className="max-w-md space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormError message={errors.root?.message} />
          <Input label="Current password" type="password" error={errors.currentPassword?.message} {...register("currentPassword")} />
          <Input label="New password" type="password" error={errors.newPassword?.message} {...register("newPassword")} />
          <Button type="submit" loading={isSubmitting}>
            Update password
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
