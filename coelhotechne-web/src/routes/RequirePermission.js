import { ShieldAlert } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABELS } from "../auth/permissions";

/**
 * Bloqueia o conteúdo (não apenas esconde) quando o usuário logado não tem
 * a permissão exigida. Use para telas inteiras (Usuários, Assinaturas) ou
 * para trechos sensíveis dentro de uma tela.
 */
export default function RequirePermission({ permission, children, fallback }) {
  const { hasPermission, user } = useAuth();

  if (hasPermission(permission)) return children;

  if (fallback) return fallback;

  return (
    <div className="empty-state">
      <ShieldAlert size={28} color="var(--warning)" />
      <h3>Acesso restrito</h3>
      <p>
        Seu perfil atual ({user ? ROLE_LABELS[user.role] : "—"}) não tem permissão para ver este conteúdo.
        Peça a um administrador para ajustar seu acesso.
      </p>
    </div>
  );
}
