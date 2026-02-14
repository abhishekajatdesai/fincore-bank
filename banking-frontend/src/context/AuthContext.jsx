import React, { createContext, useCallback, useMemo, useState } from "react";
import { clearAuthToken, getAuthToken, setAuthToken } from "../services/api";

export const AuthContext = createContext({
  token: null,
  role: null,
  accountNo: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  setAccountNo: () => {}
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken());
  const [role, setRole] = useState(
    () => window.localStorage.getItem("fincore_role") || null
  );
  const [accountNo, setAccountNoState] = useState(
    () => window.localStorage.getItem("fincore_account") || ""
  );

  const login = useCallback((nextToken, nextRole, nextAccountNo) => {
    if (!nextToken) return;
    setAuthToken(nextToken);
    setToken(nextToken);
    if (nextRole) {
      setRole(nextRole);
      window.localStorage.setItem("fincore_role", nextRole);
    }
    if (nextAccountNo) {
      setAccountNoState(nextAccountNo);
      window.localStorage.setItem("fincore_account", nextAccountNo);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setToken(null);
    setRole(null);
    setAccountNoState("");
    window.localStorage.removeItem("fincore_role");
    window.localStorage.removeItem("fincore_account");
  }, []);

  const setAccountNo = useCallback((nextAccountNo) => {
    setAccountNoState(nextAccountNo);
    window.localStorage.setItem("fincore_account", nextAccountNo);
  }, []);

  const value = useMemo(
    () => ({
      token,
      role,
      accountNo,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setAccountNo
    }),
    [token, role, accountNo, login, logout, setAccountNo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
