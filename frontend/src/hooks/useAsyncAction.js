import { useState } from "react";
import { apiErrorMessage } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function run(action, successMessage) {
    if (loading) return null;
    setLoading(true);
    try {
      const result = await action();
      if (successMessage) toast.success(successMessage);
      return result;
    } catch (error) {
      toast.error(apiErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { loading, run };
}
