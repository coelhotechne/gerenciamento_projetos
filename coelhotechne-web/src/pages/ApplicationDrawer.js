import { useEffect, useState } from "react";
import { KeyRound, Plus, Copy, Check, Ban } from "lucide-react";
import Drawer from "../components/Drawer";
import Badge from "../components/Badge";
import IdChip from "../components/IdChip";
import { useAuth } from "../auth/AuthContext";
import { PERMISSIONS } from "../auth/permissions";
import { getApplication, generateApiKey, revokeApiKey, updateApplicationStatus } from "../api/applicationsService";
import { formatDate, formatDateTime } from "../utils/format";
import { APP_STATUS, ENVIRONMENT_LABEL, API_KEY_STATUS } from "../utils/labels";
import "./Applications.css";

const TABS = [
  { id: "overview", label: "Visão geral" },
  { id: "versions", label: "Versões" },
  { id: "keys", label: "Chaves de API" },
];

export default function ApplicationDrawer({ appId, onClose, onChanged }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.APPS_MANAGE);
  const canManageKeys = hasPermission(PERMISSIONS.APPS_KEYS_MANAGE);

  const [tab, setTab] = useState("overview");
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealedKey, setRevealedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!appId) return;
    setLoading(true);
    setRevealedKey(null);
    setTab("overview");
    getApplication(appId).then((data) => {
      setApp(data);
      setLoading(false);
    });
  }, [appId]);

  async function handleGenerateKey() {
    setGenerating(true);
    try {
      const key = await generateApiKey(app.id);
      setRevealedKey(key);
      const fresh = await getApplication(app.id);
      setApp(fresh);
      onChanged?.();
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevoke(keyId) {
    await revokeApiKey(app.id, keyId);
    const fresh = await getApplication(app.id);
    setApp(fresh);
    onChanged?.();
  }

  async function handleStatusChange(status) {
    await updateApplicationStatus(app.id, status);
    const fresh = await getApplication(app.id);
    setApp(fresh);
    onChanged?.();
  }

  function handleCopy(secret) {
    navigator.clipboard?.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Drawer open={Boolean(appId)} onClose={onClose} title={loading ? "Carregando…" : app?.name} subtitle={app ? app.slug : ""}>
      {!loading && app && (
        <>
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.id} className={`tab${tab === t.id ? " is-active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="drawer-tabs-content">
              <div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{app.description}</p>
                <div className="tag-row" style={{ marginTop: 10 }}>
                  {app.tags.map((t) => (
                    <span className="tag-pill" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="detail-row">
                  <span>Identificador</span>
                  <IdChip>{app.id}</IdChip>
                </div>
                <div className="detail-row">
                  <span>Status</span>
                  <Badge variant={APP_STATUS[app.status].variant}>{APP_STATUS[app.status].label}</Badge>
                </div>
                <div className="detail-row">
                  <span>Ambiente</span>
                  <span>{ENVIRONMENT_LABEL[app.environment]}</span>
                </div>
                <div className="detail-row">
                  <span>Versão atual</span>
                  <span className="u-mono">{app.version}</span>
                </div>
                <div className="detail-row">
                  <span>Responsável</span>
                  <span>{app.owner}</span>
                </div>
                <div className="detail-row">
                  <span>URL</span>
                  <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.url || "—"}</span>
                </div>
                <div className="detail-row">
                  <span>Criada em</span>
                  <span>{formatDate(app.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span>Atualizada em</span>
                  <span>{formatDateTime(app.updatedAt)}</span>
                </div>
              </div>

              {canManage && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                    Alterar status
                  </label>
                  <div className="u-row u-gap-2">
                    {Object.entries(APP_STATUS).map(([value, meta]) => (
                      <button
                        key={value}
                        className={`btn btn-sm ${app.status === value ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => handleStatusChange(value)}
                        disabled={app.status === value}
                      >
                        {meta.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "versions" && (
            <div className="drawer-tabs-content">
              {app.versions.map((v) => (
                <div className="version-item" key={v.version}>
                  <span className="version-dot" />
                  <div className="version-body">
                    <span className="v-number">v{v.version}</span>
                    <span className="v-date">{formatDate(v.date)}</span>
                    <p>{v.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "keys" && (
            <div className="drawer-tabs-content">
              {revealedKey && (
                <div className="secret-reveal">
                  <div className="u-row u-gap-2" style={{ color: "var(--accent)", fontSize: 12.5, fontWeight: 600 }}>
                    <KeyRound size={14} />
                    Copie agora — o segredo completo não será exibido novamente
                  </div>
                  <span className="u-mono">{revealedKey.secretOnce}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(revealedKey.secretOnce)}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copiado" : "Copiar chave"}
                  </button>
                </div>
              )}

              {canManageKeys && (
                <button className="btn btn-ghost" onClick={handleGenerateKey} disabled={generating}>
                  <Plus size={14} />
                  {generating ? "Gerando…" : "Gerar nova chave"}
                </button>
              )}

              {app.apiKeys.length === 0 && (
                <p className="u-muted" style={{ fontSize: 13 }}>
                  Nenhuma chave de API criada para esta aplicação ainda.
                </p>
              )}

              {app.apiKeys.map((key) => (
                <div className="key-row" key={key.id}>
                  <div>
                    <IdChip>{key.prefix}••••••••</IdChip>
                    <div className="key-meta">
                      Criada em {formatDate(key.createdAt)} · último uso {key.lastUsed ? formatDate(key.lastUsed) : "nunca"}
                    </div>
                  </div>
                  <div className="u-row u-gap-2">
                    <Badge variant={API_KEY_STATUS[key.status].variant}>{API_KEY_STATUS[key.status].label}</Badge>
                    {canManageKeys && key.status === "active" && (
                      <button className="btn btn-icon btn-sm btn-danger" onClick={() => handleRevoke(key.id)} title="Revogar chave">
                        <Ban size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
