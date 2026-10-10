import { useCallback, useEffect, useMemo, useState } from "react";
import { api, apiErrorMessage, unwrap } from "../api/client.js";

export function useResource(endpoint, params = {}) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const paramsKey = JSON.stringify(params);
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(endpoint, { params: stableParams });
      setItems(unwrap(response) || []);
      setMeta(response.data.meta || null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [endpoint, stableParams]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, meta, loading, error, reload: load, setItems };
}
