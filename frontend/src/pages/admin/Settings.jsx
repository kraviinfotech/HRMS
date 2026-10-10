import { useEffect, useState } from "react";
import { api, apiErrorMessage, unwrap } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((response) => setSettings(unwrap(response)))
      .catch((requestError) => setError(apiErrorMessage(requestError)));
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      const payload = {
        companyName: form.get("companyName"),
        timezone: form.get("timezone"),
        payrollCutoffDay: Number(form.get("payrollCutoffDay")),
        retentionPolicy: {
          auditLogMonths: Number(form.get("auditLogMonths")),
          documentMonths: Number(form.get("documentMonths")),
          locationMonths: Number(form.get("locationMonths")),
        },
      };
      const response = await api.patch("/admin/settings", payload);
      setSettings(unwrap(response));
      toast.success("Settings updated");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  if (error && !settings) return <div className="text-sm text-red-600">{error}</div>;
  if (!settings) return <Spinner />;

  return (
    <Card>
      <CardHeader title="Company Settings" />
      <CardBody>
        {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
          <Input label="Company name" name="companyName" defaultValue={settings.companyName} />
          <Input label="Timezone" name="timezone" defaultValue={settings.timezone} />
          <Input label="Payroll cutoff day" name="payrollCutoffDay" type="number" min="1" max="31" defaultValue={settings.payrollCutoffDay} />
          <Input label="Audit retention months" name="auditLogMonths" type="number" defaultValue={settings.retentionPolicy?.auditLogMonths} />
          <Input label="Document retention months" name="documentMonths" type="number" defaultValue={settings.retentionPolicy?.documentMonths} />
          <Input label="Location retention months" name="locationMonths" type="number" defaultValue={settings.retentionPolicy?.locationMonths} />
          <Textarea className="sm:col-span-2" label="Payroll verification note" value="Statutory rates are configurable estimates and must be verified before final payroll." readOnly />
          <div className="sm:col-span-2">
            <Button type="submit" loading={saving}>
              Save settings
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
