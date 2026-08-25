import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { listApplications, createApplication } from "../api/applicationsService";
import { useAuth } from "../auth/AuthContext";
import { PERMISSIONS } from "../auth/permissions";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import IdChip from "../components/IdChip";
import Avatar from "../components/Avatar";
import Modal from "../components/Modal";
import ApplicationDrawer from "./ApplicationDrawer";
import { formatRelativeTime } from "../utils/format";
import { APP_STATUS, ENVIRONMENT_LABEL } from "../utils/labels";
import "./Applications.css";

const STATUS_FILTERS = [
  { value: "all", label: "Todos os status" },
  { value: "active", label: "Ativo" },
  { value: "maintenance", label: "Manutenção" },
  { value: "inactive", label: "Inativo" },
];

export default function Applications() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.APPS_MANAGE);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState("all");
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await listApplications({ search, status });
    setApps(data);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearch(q);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      key: "name",
      label: "Aplicação",
      render: (row) => (
        <div className="app-name-cell">
          <span style={{ fontWeight: 600 }}>{row.name}</span>
          <span className="slug">{row.slug}</span>
        </div>
      ),
    },
    { key: "id", label: "Identificador", render: (row) => <IdChip>{row.id}</IdChip> },
    { key: "status", label: "Status", render: (row) => <Badge variant={APP_STATUS[row.status].variant}>{APP_STATUS[row.status].label}</Badge> },
    { key: "environment", label: "Ambiente", render: (row) => ENVIRONMENT_LABEL[row.environment] },
    { key: "version", label: "Versão", render: (row) => <span className="u-mono">{row.version}</span> },
    {
      key: "owner",
      label: "Responsável",
      render: (row) => (
        <span className="u-row u-gap-2">
          <Avatar name={row.owner} size={22} />
          {row.owner}
        </span>
      ),
    },
    { key: "updatedAt", label: "Atualizado", muted: true, render: (row) => formatRelativeTime(row.updatedAt) },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Aplicações</h1>
          <p>Catálogo de aplicações gerenciadas, versões e ambientes.</p>
        </div>
        {canManage && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus size={15} />
              Nova aplicação
            </button>
          </div>
        )}
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={15} color="var(--text-tertiary)" />
          <input placeholder="Buscar por nome ou identificador…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 200 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          rows={apps}
          isLoading={loading}
          onRowClick={(row) => setSelectedId(row.id)}
          emptyTitle="Nenhuma aplicação encontrada"
          emptyMessage="Ajuste os filtros ou cadastre uma nova aplicação."
        />
      </div>

      <ApplicationDrawer appId={selectedId} onClose={() => setSelectedId(null)} onChanged={load} />

      {canManage && <CreateApplicationModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />}
    </div>
  );
}

function CreateApplicationModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("staging");
  const [owner, setOwner] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createApplication({ name, description, environment, owner });
      setName("");
      setDescription("");
      setOwner("");
      setEnvironment("staging");
      onClose();
      onCreated?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova aplicação">
      <form className="u-row" style={{ flexDirection: "column", gap: 16 }} onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="app-name">Nome</label>
          <input id="app-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="app-desc">Descrição</label>
          <input id="app-desc" className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="app-env">Ambiente inicial</label>
          <select id="app-env" className="select" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
            <option value="staging">Homologação</option>
            <option value="production">Produção</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="app-owner">Responsável</label>
          <input id="app-owner" className="input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Nome do responsável" />
        </div>
        <div className="u-row u-gap-2" style={{ justifyContent: "flex-end", marginTop: 4 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Criando…" : "Criar aplicação"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
