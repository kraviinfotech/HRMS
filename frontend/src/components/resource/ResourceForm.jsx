import { useForm } from "react-hook-form";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";
import { Textarea } from "../ui/Textarea.jsx";

function rulesFor(field) {
  return {
    ...(field.validation || {}),
    required: field.required ? `${field.label} is required` : false,
  };
}

export function ResourceForm({ fields, onSubmit, loading, submitLabel = "Save" }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field) => {
        const error = errors[field.name]?.message;
        const rules = rulesFor(field);
        if (field.type === "textarea") {
          return (
            <Textarea
              key={field.name}
              label={field.label}
              className="sm:col-span-2"
              error={error}
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              {...register(field.name, rules)}
            />
          );
        }

        if (field.type === "select") {
          return (
            <Select
              key={field.name}
              label={field.label}
              error={error}
              options={field.options}
              defaultValue={field.defaultValue}
              {...register(field.name, rules)}
            />
          );
        }

        if (field.type === "checkbox") {
          return (
            <label key={field.name} className="mt-7 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <input className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" type="checkbox" {...register(field.name)} />
              {field.label}
            </label>
          );
        }

        return (
          <Input
            key={field.name}
            label={field.label}
            type={field.type || "text"}
            error={error}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            defaultValue={field.defaultValue}
            min={field.min}
            max={field.max}
            minLength={field.minLength}
            maxLength={field.maxLength}
            step={field.step}
            {...register(field.name, rules)}
          />
        );
      })}
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
