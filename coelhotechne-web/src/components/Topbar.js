import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, RefreshCw, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABELS } from "../auth/permissions";
import Avatar from "./Avatar";

export default function Topbar() {
  const { user, expiresAt, refreshSession, logout } = useAuth();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = expiresAt ? expiresAt - now : 0;
  const remainingMin = Math.floor(Math.max(remainingMs, 0) / 60000);
  const remainingSec = Math.floor((Math.max(remainingMs, 0) % 60000) / 1000);
  const isLow = remainingMs > 0 && remainingMs < 2 * 60 * 1000;
  const isExpired = remainingMs <= 0;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshSession();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (search.trim()) navigate(`/aplicacoes?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <header className="topbar">
      <form className="topbar-search" onSubmit={handleSearchSubmit}>
        <Search size={15} />
        <input
          placeholder="Buscar aplicações…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar aplicações"
        />
      </form>

      <div className="topbar-right">
        <button
          type="button"
          className={`session-pill${isLow || isExpired ? " is-warning" : ""}`}
          onClick={handleRefresh}
          title="Renovar sessão agora"
        >
          <span className="dot" />
          {isExpired ? (
            <>Sessão expirada</>
          ) : (
            <>
              Sessão expira em{" "}
              <span className="time">
                {String(remainingMin).padStart(2, "0")}:{String(remainingSec).padStart(2, "0")}
              </span>
            </>
          )}
          <RefreshCw size={12} className={refreshing ? "u-spin" : ""} />
        </button>

        <div className="user-menu">
          <button className="user-trigger" onClick={() => setMenuOpen((v) => !v)}>
            <Avatar name={user?.name} size={30} />
            <span className="user-trigger-meta">
              <span className="user-trigger-name">{user?.name}</span>
              <br />
              <span className="user-trigger-role">{ROLE_LABELS[user?.role]}</span>
            </span>
            <ChevronDown size={14} color="var(--text-tertiary)" />
          </button>

          {menuOpen && (
            <div className="user-dropdown" onMouseLeave={() => setMenuOpen(false)}>
              <div className="u-row u-gap-2" style={{ padding: "6px 8px 10px" }}>
                <ShieldCheck size={13} color="var(--success)" />
                <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>Autenticado via JWT + RBAC</span>
              </div>
              <button className="user-dropdown-item is-danger" onClick={handleLogout}>
                <LogOut size={15} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
