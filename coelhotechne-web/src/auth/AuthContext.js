import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as authService from "../api/authService";
import { registerTokenGetter, registerUnauthorizedHandler } from "../api/httpClient";
import { roleHasPermission } from "./permissions";

const AuthContext = createContext(null);

// Apenas para conveniência da demonstração: guarda o id do usuário logado
// para restaurar a sessão ao atualizar a página. O token de acesso em si
// NUNCA é persistido — ele vive somente em memória (estado React), que é a
// prática recomendada contra roubo de token via XSS. Em produção, a
// renovação de sessão deve depender de um refresh token em cookie httpOnly
// gerenciado pelo backend, não deste mecanismo.
const SESSION_HINT_KEY = "techne_session_hint";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | authenticated | error
  const [error, setError] = useState(null);

  const tokenRef = useRef(null);
  tokenRef.current = accessToken;

  useEffect(() => {
    registerTokenGetter(() => tokenRef.current);
    registerUnauthorizedHandler(() => {
      clearSession();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hint = sessionStorage.getItem(SESSION_HINT_KEY);
    if (hint) {
      authService
        .loginAsDemo(hint)
        .then(applySession)
        .catch(() => sessionStorage.removeItem(SESSION_HINT_KEY));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applySession({ user, accessToken, expiresAt }) {
    setUser(user);
    setAccessToken(accessToken);
    setExpiresAt(expiresAt);
    setStatus("authenticated");
    setError(null);
    sessionStorage.setItem(SESSION_HINT_KEY, user.id);
  }

  function clearSession() {
    setUser(null);
    setAccessToken(null);
    setExpiresAt(null);
    setStatus("idle");
    sessionStorage.removeItem(SESSION_HINT_KEY);
  }

  const login = useCallback(async (email, password) => {
    setStatus("loading");
    setError(null);
    try {
      const session = await authService.login({ email, password });
      applySession(session);
      return session;
    } catch (err) {
      setStatus("error");
      setError(err.message || "Não foi possível entrar.");
      throw err;
    }
  }, []);

  const loginAsDemo = useCallback(async (userId) => {
    setStatus("loading");
    setError(null);
    try {
      const session = await authService.loginAsDemo(userId);
      applySession(session);
      return session;
    } catch (err) {
      setStatus("error");
      setError(err.message || "Não foi possível entrar.");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    clearSession();
  }, []);

  const refreshSession = useCallback(async () => {
    if (!user) return;
    const { accessToken, expiresAt } = await authService.refresh(user.id);
    setAccessToken(accessToken);
    setExpiresAt(expiresAt);
  }, [user]);

  const hasPermission = useCallback((permission) => roleHasPermission(user?.role, permission), [user]);

  const value = {
    user,
    accessToken,
    expiresAt,
    status,
    error,
    isAuthenticated: Boolean(user && accessToken),
    login,
    loginAsDemo,
    logout,
    refreshSession,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa ser usado dentro de <AuthProvider>.");
  return ctx;
}
