// ---------------------------------------------------------------------------
// Modelo de RBAC (Role-Based Access Control) do Techne.
//
// Cada papel carrega um conjunto fixo de permissões. As telas e ações da
// interface consultam `hasPermission()` (ver AuthContext) em vez de checar
// o papel diretamente — assim, se o backend real (baseado no erp_saas_storage)
// expuser permissões granulares por usuário, basta trocar a origem deste
// mapa sem tocar nos componentes.
// ---------------------------------------------------------------------------

export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  DEVELOPER: "developer",
  VIEWER: "viewer",
};

export const ROLE_LABELS = {
  [ROLES.OWNER]: "Proprietário",
  [ROLES.ADMIN]: "Administrador",
  [ROLES.DEVELOPER]: "Desenvolvedor",
  [ROLES.VIEWER]: "Visualizador",
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.OWNER]: "Acesso total, incluindo faturamento e exclusão de aplicações.",
  [ROLES.ADMIN]: "Gerencia aplicações, usuários e permissões. Sem acesso a faturamento.",
  [ROLES.DEVELOPER]: "Gerencia aplicações e chaves de API. Acesso de leitura a usuários.",
  [ROLES.VIEWER]: "Acesso somente leitura às áreas liberadas para o seu perfil.",
};

export const PERMISSIONS = {
  APPS_VIEW: "apps:view",
  APPS_MANAGE: "apps:manage",
  APPS_KEYS_MANAGE: "apps:keys:manage",
  USERS_VIEW: "users:view",
  USERS_MANAGE: "users:manage",
  BILLING_VIEW: "billing:view",
  BILLING_MANAGE: "billing:manage",
  LOGS_VIEW: "logs:view",
  LOGS_VIEW_FULL: "logs:view:full", // inclui IP e user-agent, sem redação
  ALERTS_ACK: "alerts:ack",
};

const { APPS_VIEW, APPS_MANAGE, APPS_KEYS_MANAGE, USERS_VIEW, USERS_MANAGE, BILLING_VIEW, BILLING_MANAGE, LOGS_VIEW, LOGS_VIEW_FULL, ALERTS_ACK } =
  PERMISSIONS;

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [APPS_VIEW, APPS_MANAGE, APPS_KEYS_MANAGE, USERS_VIEW, USERS_MANAGE, BILLING_VIEW, BILLING_MANAGE, LOGS_VIEW, LOGS_VIEW_FULL, ALERTS_ACK],
  [ROLES.ADMIN]: [APPS_VIEW, APPS_MANAGE, APPS_KEYS_MANAGE, USERS_VIEW, USERS_MANAGE, BILLING_VIEW, LOGS_VIEW, LOGS_VIEW_FULL, ALERTS_ACK],
  [ROLES.DEVELOPER]: [APPS_VIEW, APPS_MANAGE, APPS_KEYS_MANAGE, USERS_VIEW, LOGS_VIEW, ALERTS_ACK],
  [ROLES.VIEWER]: [APPS_VIEW, LOGS_VIEW],
};

export function roleHasPermission(role, permission) {
  return Boolean(ROLE_PERMISSIONS[role]?.includes(permission));
}
