import { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AppWindow, Users, CreditCard, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { PERMISSIONS } from "../auth/permissions";
import { listApplications } from "../api/applicationsService";
import { listUsers } from "../api/usersService";
import { listSubscriptions } from "../api/subscriptionsService";
import { listAlerts, acknowledgeAlert, getUsageSeries, getActivityFeed } from "../api/monitoringService";
import StatCard from "../components/StatCard";
import { formatNumber, formatRelativeTime } from "../utils/format";
import "./Overview.css";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card card-pad" style={{ padding: "10px 14px", boxShadow: "var(--shadow-md)" }}>
      <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600 }}>{formatNumber(payload[0].value)} requisições</p>
    </div>
  );
}

export default function Overview() {
  const { hasPermission, user } = useAuth();
  const canViewUsers = hasPermission(PERMISSIONS.USERS_VIEW);
  const canViewBilling = hasPermission(PERMISSIONS.BILLING_VIEW);
  const canAckAlerts = hasPermission(PERMISSIONS.ALERTS_ACK);

  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [subs, setSubs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [series, setSeries] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const tasks = [
        listApplications(),
        canViewUsers ? listUsers() : Promise.resolve([]),
        canViewBilling ? listSubscriptions() : Promise.resolve([]),
        listAlerts(),
        getUsageSeries(),
        getActivityFeed(),
      ];
      const [appsData, usersData, subsData, alertsData, seriesData, activityData] = await Promise.all(tasks);
      if (!mounted) return;
      setApps(appsData);
      setUsersCount(usersData.length);
      setSubs(subsData);
      setAlerts(alertsData);
      setSeries(seriesData);
      setActivity(activityData);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [canViewUsers, canViewBilling]);

  const activeApps = apps.filter((a) => a.status === "active").length;
  const activeSubs = subs.filter((s) => s.status === "active").length;
  const openAlerts = alerts.filter((a) => !a.acknowledged);

  const cards = useMemo(() => {
    const list = [
      { key: "apps", icon: AppWindow, label: "Aplicações ativas", value: loading ? "—" : activeApps, trend: 4, trendNote: "vs. mês anterior" },
    ];
    if (canViewUsers) {
      list.push({ key: "users", icon: Users, label: "Usuários ativos", value: loading ? "—" : usersCount, trend: 2, trendNote: "vs. mês anterior" });
    }
    if (canViewBilling) {
      list.push({ key: "subs", icon: CreditCard, label: "Assinaturas ativas", value: loading ? "—" : activeSubs, trend: -1, trendNote: "vs. mês anterior" });
    }
    list.push({
      key: "alerts",
      icon: AlertTriangle,
      label: "Alertas abertos",
      value: loading ? "—" : openAlerts.length,
    });
    return list;
  }, [loading, activeApps, usersCount, activeSubs, openAlerts.length, canViewUsers, canViewBilling]);

  async function handleAck(id) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
    await acknowledgeAlert(id);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Olá, {user?.name?.split(" ")[0]}</h1>
          <p>Panorama das aplicações, uso e segurança da plataforma hoje.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: `repeat(${cards.length}, 1fr)` }}>
        {cards.map((c) => (
          <StatCard key={c.key} icon={c.icon} label={c.label} value={c.value} trend={c.trend} trendNote={c.trendNote} />
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="panel-title">
            <div>
              <h2>Uso da plataforma</h2>
              <p>Requisições agregadas de todas as aplicações — últimos 7 dias</p>
            </div>
          </div>
          <div style={{ padding: "var(--space-4) var(--space-5) var(--space-5)" }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={series} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} width={46} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="requisicoes" stroke="var(--accent)" strokeWidth={2} fill="url(#usageFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="panel-title">
            <div>
              <h2>Alertas</h2>
              <p>{openAlerts.length} em aberto</p>
            </div>
          </div>
          <div style={{ paddingBottom: 6 }}>
            {alerts.length === 0 && !loading && (
              <div className="empty-state" style={{ padding: "var(--space-6) var(--space-4)" }}>
                <Check size={22} color="var(--success)" />
                <h3>Tudo certo</h3>
                <p>Nenhum alerta no momento.</p>
              </div>
            )}
            {alerts.map((alert) => (
              <div className="alert-item" key={alert.id} style={{ opacity: alert.acknowledged ? 0.5 : 1 }}>
                <span className={`alert-dot ${alert.severity}`} />
                <div style={{ flex: 1 }}>
                  <p className="alert-text">{alert.message}</p>
                  <p className="alert-app">{alert.appName}</p>
                </div>
                {canAckAlerts && !alert.acknowledged && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleAck(alert.id)}>
                    Reconhecer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "var(--space-4)" }}>
        <div className="panel-title">
          <div>
            <h2>Atividade recente</h2>
            <p>Trilha de auditoria das últimas ações na plataforma</p>
          </div>
        </div>
        <div style={{ paddingBottom: 6 }}>
          {activity.map((a) => (
            <div className="activity-row" key={a.id}>
              <div className="activity-text">
                <strong>{a.actor}</strong> {a.action} <span className="u-mono u-muted">{a.target}</span>
              </div>
              <span className="activity-time">{formatRelativeTime(a.at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
