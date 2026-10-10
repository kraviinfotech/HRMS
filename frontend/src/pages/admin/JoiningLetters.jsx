import { useState } from "react";
import { FileText } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function JoiningLetters() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function generate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const employee = new FormData(event.currentTarget).get("employee");
      const response = await api.post("/admin/joining-letters", { employee }, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data]));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "joining-letter.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Joining Letters" />
      <CardBody>
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <form className="flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end" onSubmit={generate}>
          <Input className="flex-1" label="Employee ID" name="employee" required />
          <Button icon={FileText} type="submit" loading={saving}>Generate</Button>
        </form>
      </CardBody>
    </Card>
  );
}
