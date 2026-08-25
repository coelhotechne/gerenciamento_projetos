import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { demoAccounts } from "../mocks/mockData";
import { ROLE_LABELS } from "../auth/permissions";
import BrandMark from "../components/BrandMark";
import "./Login.css";

export default function Login() {
  const { login, loginAsDemo, isAuthenticated, status, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [demoLoadingId, setDemoLoadingId] = useState(null);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || "/"} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(location.state?.from || "/", { replace: true });
    } catch {
      // erro já exposto via `error` do contexto
    }
  }

  async function handleDemo(userId) {
    setDemoLoadingId(userId);
    try {
      await loginAsDemo(userId);
      navigate("/", { replace: true });
    } finally {
      setDemoLoadingId(null);
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <BrandMark size={30} />
          <span className="login-brand-text">
           Coelho Techne<span>.</span>
          </span>
        </div>

        <div className="login-heading">
          <h1>Central de gerenciamento de aplicações</h1>
          <p>Entre para acompanhar aplicações, usuários, licenciamento e monitoramento.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="field">
            <label htmlFor="email">E-mail corporativo</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="voce@coelhotechne.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <div className="password-field">
              <input
                id="password"
                className="input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: 38 }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={isLoading} style={{ marginTop: 4 }}>
            {isLoading ? <Loader2 size={15} className="u-spin" /> : null}
            Entrar
          </button>
        </form>

        <div className="login-divider">ou use uma conta de demonstração</div>

        <div className="demo-grid">
          {demoAccounts.map((acc) => (
            <button key={acc.userId} className="demo-account" onClick={() => handleDemo(acc.userId)} disabled={isLoading}>
              <span className="demo-account-name">
                {demoLoadingId === acc.userId ? "Entrando…" : acc.label}
              </span>
              <span className="badge badge-neutral">{ROLE_LABELS[acc.role]}</span>
            </button>
          ))}
        </div>

        <p className="login-footnote">
          Ambiente de demonstração — a autenticação roda contra dados simulados no navegador,
          sem backend real. Ao integrar a API de gerenciamento de aplicações, este fluxo passa a
          emitir tokens JWT válidos por perfil (RBAC) via requisição HTTP.
        </p>
      </div>
    </div>
  );
}
