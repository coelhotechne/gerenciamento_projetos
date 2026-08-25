import { NavLink } from "react-router-dom";
import { LayoutDashboard, AppWindow, Users, CreditCard, Activity, ShieldCheck } from "lucide-react";
import BrandMark from "./BrandMark";
import { useAuth } from "../auth/AuthContext";
import { PERMISSIONS } from "../auth/permissions";

const NAV_ITEMS = [
  { to: "/", label: "Visão Geral", icon: LayoutDashboard, permission: null, end: true },
  { to: "/aplicacoes", label: "Aplicações", icon: AppWindow, permission: PERMISSIONS.APPS_VIEW },
  { to: "/usuarios", label: "Usuários & Permissões", icon: Users, permission: PERMISSIONS.USERS_VIEW },
  { to: "/assinaturas", label: "Assinaturas", icon: CreditCard, permission: PERMISSIONS.BILLING_VIEW },
  { to: "/monitoramento", label: "Monitoramento", icon: Activity, permission: PERMISSIONS.LOGS_VIEW },
];

export default function Sidebar() {
  const { hasPermission } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">
          <BrandMark size={28} />
        </span>
        <span className="sidebar-brand-text">
          Coelho Techne<span>.</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Plataforma</span>
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item${isActive ? " is-active" : ""}`}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="u-row u-gap-2">
          <ShieldCheck size={13} color="var(--success)" />
          RBAC ativo
        </span>
        <span>v1.0.0</span>
      </div>
    </aside>
  );
}
