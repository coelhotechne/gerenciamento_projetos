import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { listLogs, listAlerts, acknowledgeAlert, getUsagePerApp } from "../api/monitoringService";
import { mockApplications } from "../mocks/mockData";
import { useAuth } from "../auth/AuthContext";
import { PERMISSIONS } from "../auth/permissions";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import { formatDateTime, formatNumber } from "../utils/format";
import { LOG_LEVEL } from "../utils/labels";
import "./Overview.css";
import "./Monitoring.css";

const LEVEL_FILTERS = [
  { value: "all", label: "Todos os níveis" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Atenção" },
  { value: "error", label: "Erro" },
  { value: "critical", label: "Crítico" },
];

function UsageTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: "10px 14px", boxShadow: "var(--shadow-md)" }}>
      <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600 }}>{formatNumber(payload[0].value)} req.</p>
    </div>
  );
}

export default function Monitoring() {
  const { hasPermission } = useAuth();
  const canViewFull = hasPermission(PERMISSIONS.LOGS_VIEW_FULL);
  const canAck = hasPermission(PERMISSIONS.ALERTS_ACK);

  const [appId, setAppId] = useState("all");
  const [level, setLevel] = useState("all");
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [usagePerApp, setUsagePerApp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setLogs(await listLogs({ appId, level, canViewFull }));
    setLoading(false);
  }, [appId, level, canViewFull]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    listAlerts().then(setAlerts);
    getUsagePerApp().then(setUsagePerApp);
  }, []);

  async function handleAck(id) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
    await acknowledgeAlert(id);
  }

  const columns = [
    { key: "timestamp", label: "Data/hora", muted: true, render: (row) => <span className="u-mono">{formatDateTime(row.timestamp)}</span> },
    { key: "appName", label: "Aplicação" },
    { key: "level", label: "Nível", render: (row) => <Badge variant={LOG_LEVEL[row.level].variant}>{LOG_LEVEL[row.level].label}</Badge> },
    { key: "message", label: "Mensagem", render: (row) => <span className="log-message-cell">{row.message}</span> },
    { key: "requestId", label: "Requisição", render: (row) => <span className="u-mono">{row.requestId}</span> },
  ];

  const openAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Monitoramento</h1>
          <p>Logs, uso por aplicação e alertas ativos.</p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="panel-title">
            <div>
              <h2>Uso por aplicação</h2>
              <p>Requisições nos últimos 7 dias</p>
            </div>
          </div>
          <div style={{ padding: "var(--space-4) var(--space-5) var(--space-5)" }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={usagePerApp} layout="vertical" margin={{ left: 8, right: 12 }}>
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="app"
                  width={110}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11.5 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<UsageTooltip />} cursor={{ fill: "var(--surface-hover)" }} />
                <Bar dataKey="uso" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="panel-title">
            <div>
              <h2>Alertas ativos</h2>
              <p>{openAlerts.length} em aberto</p>
            </div>
          </div>
          <div style={{ paddingBottom: 6 }}>
            {alerts.map((alert) => (
              <div className="alert-item" key={alert.id} style={{ opacity: alert.acknowledged ? 0.5 : 1 }}>
                <span className={`alert-dot ${alert.severity}`} />
                <div style={{ flex: 1 }}>
                  <p className="alert-text">{alert.message}</p>
                  <p className="alert-app">{alert.appName}</p>
                </div>
                {canAck && !alert.acknowledged && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleAck(alert.id)}>
                    Reconhecer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="toolbar" style={{ marginTop: "var(--space-4)" }}>
        <select className="select" style={{ width: 220 }} value={appId} onChange={(e) => setAppId(e.target.value)}>
          <option value="all">Todas as aplicações</option>
          {mockApplications.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select className="select" style={{ width: 180 }} value={level} onChange={(e) => setLevel(e.target.value)}>
          {LEVEL_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          rows={logs}
          isLoading={loading}
          onRowClick={(row) => setSelectedLog(row)}
          emptyTitle="Nenhum log encontrado"
          emptyMessage="Ajuste os filtros para ver mais resultados."
        />
      </div>

      {!canViewFull && (
        <p className="u-muted" style={{ fontSize: 11.5, marginTop: 10 }}>
          IP e user-agent ficam ocultos para o seu perfil. Proprietários e administradores veem o registro completo.
        </p>
      )}

      <Modal open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} title="Detalhe do log" width="560px">
        {selectedLog && (
          <div className="log-payload">
            <div>
              <span className="k">timestamp </span>
              <span className="v">{selectedLog.timestamp}</span>
            </div>
            <div>
              <span className="k">app </span>
              <span className="v">
                {selectedLog.appName} ({selectedLog.appId})
              </span>
            </div>
            <div>
              <span className="k">level </span>
              <span className="v">{selectedLog.level}</span>
            </div>
            <div>
              <span className="k">request_id </span>
              <span className="v">{selectedLog.requestId}</span>
            </div>
            <div>
              <span className="k">ip </span>
              <span className="v">{selectedLog.ip}</span>
            </div>
            <div>
              <span className="k">user_agent </span>
              <span className="v">{selectedLog.userAgent}</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <span className="k">message</span>
              <br />
              <span className="v">{selectedLog.message}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
