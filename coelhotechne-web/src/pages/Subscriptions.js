import { useEffect, useState, useMemo } from "react";
import { CreditCard, TrendingUp } from "lucide-react";
import { listSubscriptions } from "../api/subscriptionsService";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import { formatCurrencyBRL, formatDate, formatNumber } from "../utils/format";
import { SUBSCRIPTION_STATUS } from "../utils/labels";

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSubscriptions().then((data) => {
      setSubs(data);
      setLoading(false);
    });
  }, []);

  const mrr = useMemo(
    () =>
      subs.reduce((sum, s) => {
        if (s.status !== "active") return sum;
        return sum + (s.cycle === "annual" ? s.price / 12 : s.price);
      }, 0),
    [subs]
  );

  const counts = useMemo(() => {
    const c = { active: 0, trial: 0, past_due: 0, canceled: 0 };
    subs.forEach((s) => (c[s.status] = (c[s.status] || 0) + 1));
    return c;
  }, [subs]);

  const columns = [
    {
      key: "appName",
      label: "Aplicação",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.appName}</div>
          <div className="u-muted" style={{ fontSize: 11.5 }}>
            Plano {row.plan}
          </div>
        </div>
      ),
    },
    { key: "status", label: "Status", render: (row) => <Badge variant={SUBSCRIPTION_STATUS[row.status].variant}>{SUBSCRIPTION_STATUS[row.status].label}</Badge> },
    { key: "cycle", label: "Ciclo", render: (row) => (row.cycle === "annual" ? "Anual" : "Mensal") },
    { key: "nextBilling", label: "Próxima cobrança", muted: true, render: (row) => formatDate(row.nextBilling) },
    {
      key: "usage",
      label: "Uso do limite",
      render: (row) => {
        const pct = Math.min(100, Math.round((row.usage / row.limit) * 100));
        const cls = pct >= 90 ? "is-danger" : pct >= 75 ? "is-warning" : "";
        return (
          <div style={{ width: 160 }}>
            <div className="u-between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 11.5 }} className="u-muted">
                {formatNumber(row.usage)}/{formatNumber(row.limit)}
              </span>
              <span style={{ fontSize: 11.5 }} className="u-muted">
                {row.metric}
              </span>
            </div>
            <div className="progress">
              <div className={`progress-fill ${cls}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      },
    },
    { key: "price", label: "Valor", render: (row) => `${formatCurrencyBRL(row.price)}${row.cycle === "annual" ? "/ano" : "/mês"}` },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Assinaturas & Licenciamento</h1>
          <p>Planos, cobrança e uso por aplicação.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={TrendingUp} label="Receita mensal recorrente" value={loading ? "—" : formatCurrencyBRL(mrr)} />
        <StatCard icon={CreditCard} label="Assinaturas ativas" value={loading ? "—" : counts.active} />
        <StatCard icon={CreditCard} label="Em teste" value={loading ? "—" : counts.trial} />
        <StatCard icon={CreditCard} label="Em atraso" value={loading ? "—" : counts.past_due} />
      </div>

      <div className="card">
        <DataTable columns={columns} rows={subs} isLoading={loading} emptyTitle="Nenhuma assinatura" emptyMessage="Nenhuma aplicação possui plano ativo." />
      </div>
    </div>
  );
}
