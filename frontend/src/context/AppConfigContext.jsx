import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, unwrap } from "../api/client.js";

const AppConfigContext = createContext(null);

const fallbackConfig = {
  appName: "Kravi Infotech HRMS",
  environment: "development",
};

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState(fallbackConfig);

  useEffect(() => {
    api
      .get("/config/public")
      .then((response) => {
        const publicConfig = unwrap(response);
        if (publicConfig?.appName) {
          setConfig({ ...fallbackConfig, ...publicConfig });
          document.title = publicConfig.appName;
        }
      })
      .catch(() => {
        document.title = fallbackConfig.appName;
      });
  }, []);

  const value = useMemo(() => config, [config]);

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context) throw new Error("useAppConfig must be used inside AppConfigProvider");
  return context;
}
