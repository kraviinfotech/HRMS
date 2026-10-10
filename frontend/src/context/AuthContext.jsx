import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, apiErrorMessage, clearCsrfToken, setCsrfToken, unwrap } from "../api/client.js";

const AuthContext = createContext(null);
const SESSION_HINT_KEY = "kravi.session.active";

let restorePromise = null;

function hasSessionHint() {
  try {
    return window.localStorage.getItem(SESSION_HINT_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberSession() {
  try {
    window.localStorage.setItem(SESSION_HINT_KEY, "true");
  } catch {
    // A storage hint is only an optimization; backend cookies still enforce auth.
  }
}

function forgetSession() {
  try {
    window.localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

function fetchCurrentUser() {
  if (!restorePromise) {
    restorePromise = api
      .get("/auth/me")
      .then((response) => unwrap(response))
      .finally(() => {
        restorePromise = null;
      });
  }
  return restorePromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => hasSessionHint());
  const authVersion = useRef(0);

  const restore = useCallback(async ({ force = false } = {}) => {
    const version = authVersion.current;
    if (!force && !hasSessionHint()) {
      clearCsrfToken();
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const data = await fetchCurrentUser();
      rememberSession();
      if (authVersion.current === version) {
        setUser(data.user);
      }
      return data.user;
    } catch (error) {
      if (error.response?.status === 401) {
        forgetSession();
        clearCsrfToken();
      }
      if (authVersion.current === version) {
        setUser(null);
      }
      return null;
    } finally {
      if (authVersion.current === version) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (hasSessionHint()) {
      restore();
    } else {
      setLoading(false);
    }
  }, [restore]);

  const login = useCallback(async (credentials) => {
    authVersion.current += 1;
    forgetSession();
    clearCsrfToken();
    const data = unwrap(await api.post("/auth/login", credentials));
    setCsrfToken(data.csrfToken);
    rememberSession();
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    authVersion.current += 1;
    try {
      await api.post("/auth/logout");
    } finally {
      clearCsrfToken();
      forgetSession();
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      restore,
      apiErrorMessage,
    }),
    [user, loading, login, logout, restore],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
