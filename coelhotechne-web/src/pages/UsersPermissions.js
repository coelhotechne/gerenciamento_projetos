import { useEffect, useState, useCallback } from "react";
import { UserPlus } from "lucide-react";
import { listUsers, inviteUser, updateUserAccess, setUserStatus, applicationOptions } from "../api/usersService";
import { useAuth } from "../auth/AuthContext";
import { PERMISSIONS, ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from "../auth/permissions";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import Avatar from "../components/Avatar";
import Modal from "../components/Modal";
import { formatRelativeTime } from "../utils/format";
import { USER_STATUS } from "../utils/labels";
import "./Users.css";

const ROLE_OPTIONS = Object.values(ROLES);
const apps = applicationOptions();

export default function UsersPermissions() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setUsers(await listUsers());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: "name",
      label: "Usuário",
      render: (row) => (
        <span className="u-row u-gap-2">
          <Avatar name={row.name} size={26} />
          <span>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <div className="u-muted" style={{ fontSize: 11.5 }}>
              {row.email}
            </div>
          </span>
        </span>
      ),
    },
    { key: "role", label: "Papel", render: (row) => <Badge variant="neutral">{ROLE_LABELS[row.role]}</Badge> },
    {
      key: "apps",
      label: "Acesso a aplicações",
      render: (row) => (
        <div className="access-chips">
          {row.apps.length === 0 && <span className="u-muted">Nenhum</span>}
          {row.apps.slice(0, 2).map((appId) => (
            <span className="tag-pill" key={appId}>
              {apps.find((a) => a.id === appId)?.name || appId}
            </span>
          ))}
          {row.apps.length > 2 && <span className="tag-pill">+{row.apps.length - 2}</span>}
        </div>
      ),
    },
    { key: "status", label: "Status", render: (row) => <Badge variant={USER_STATUS[row.status].variant}>{USER_STATUS[row.status].label}</Badge> },
    { key: "lastAccess", label: "Último acesso", muted: true, render: (row) => formatRelativeTime(row.lastAccess) },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Usuários & Permissões</h1>
          <p>Controle quem acessa a plataforma e quais aplicações cada pessoa pode gerenciar.</p>
        </div>
        {canManage && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setInviteOpen(true)}>
              <UserPlus size={15} />
              Convidar usuário
            </button>
          </div>
        )}
      </div>

      <div className="role-legend">
        {ROLE_OPTIONS.map((role) => (
          <div className="role-legend-item" key={role}>
            <h4>{ROLE_LABELS[role]}</h4>
            <p>{ROLE_DESCRIPTIONS[role]}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          rows={users}
          isLoading={loading}
          onRowClick={canManage ? (row) => setEditUser(row) : undefined}
          emptyTitle="Nenhum usuário"
          emptyMessage="Convide alguém para começar."
        />
      </div>

      {canManage && <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={load} />}
      {canManage && editUser && (
        <EditAccessModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => {
            setEditUser(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function InviteModal({ open, onClose, onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES.VIEWER);
  const [selectedApps, setSelectedApps] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  function toggleApp(id) {
    setSelectedApps((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await inviteUser({ email, role, apps: selectedApps });
      setEmail("");
      setRole(ROLES.VIEWER);
      setSelectedApps([]);
      onClose();
      onInvited?.();
    } catch (error) {
      setErr(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Convidar usuário">
      <form style={{ display: "flex", flexDirection: "column", gap: 16 }} onSubmit={handleSubmit}>
        {err && <div className="login-error">{err}</div>}
        <div className="field">
          <label htmlFor="invite-email">E-mail</label>
          <input id="invite-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="invite-role">Papel</label>
          <select id="invite-role" className="select" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Acesso a aplicações</label>
          <div className="permission-matrix">
            {apps.map((a) => (
              <label className="permission-matrix-row" key={a.id}>
                <input type="checkbox" checked={selectedApps.includes(a.id)} onChange={() => toggleApp(a.id)} />
                {a.name}
              </label>
            ))}
          </div>
        </div>
        <div className="u-row u-gap-2" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Enviando…" : "Enviar convite"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditAccessModal({ user, onClose, onSaved }) {
  const [role, setRole] = useState(user.role);
  const [selectedApps, setSelectedApps] = useState(user.apps);
  const [saving, setSaving] = useState(false);

  function toggleApp(id) {
    setSelectedApps((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserAccess(user.id, { role, apps: selectedApps });
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  async function handleSuspendToggle() {
    setSaving(true);
    try {
      await setUserStatus(user.id, user.status === "suspended" ? "active" : "suspended");
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      title={`Editar acesso — ${user.name}`}
      footer={
        <>
          <button className="btn btn-ghost" onClick={handleSuspendToggle} disabled={saving}>
            {user.status === "suspended" ? "Reativar acesso" : "Suspender acesso"}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label htmlFor="edit-role">Papel</label>
          <select id="edit-role" className="select" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Acesso a aplicações</label>
          <div className="permission-matrix">
            {apps.map((a) => (
              <label className="permission-matrix-row" key={a.id}>
                <input type="checkbox" checked={selectedApps.includes(a.id)} onChange={() => toggleApp(a.id)} />
                {a.name}
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
