import { api } from "../api/client.js";

export async function downloadFromApi(path, filename) {
  const response = await api.get(path, { responseType: "blob" });
  const url = URL.createObjectURL(new Blob([response.data]));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
