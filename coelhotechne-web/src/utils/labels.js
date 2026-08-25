export const APP_STATUS = {
  active: { label: "Ativo", variant: "success" },
  inactive: { label: "Inativo", variant: "neutral" },
  maintenance: { label: "Manutenção", variant: "warning" },
};

export const ENVIRONMENT_LABEL = {
  production: "Produção",
  staging: "Homologação",
};

export const SUBSCRIPTION_STATUS = {
  active: { label: "Ativa", variant: "success" },
  trial: { label: "Em teste", variant: "info" },
  past_due: { label: "Em atraso", variant: "danger" },
  canceled: { label: "Cancelada", variant: "neutral" },
};

export const USER_STATUS = {
  active: { label: "Ativo", variant: "success" },
  invited: { label: "Convidado", variant: "info" },
  suspended: { label: "Suspenso", variant: "danger" },
};

export const LOG_LEVEL = {
  info: { label: "Info", variant: "info" },
  warning: { label: "Atenção", variant: "warning" },
  error: { label: "Erro", variant: "danger" },
  critical: { label: "Crítico", variant: "danger" },
};

export const ALERT_SEVERITY = {
  info: { label: "Info", variant: "info" },
  warning: { label: "Atenção", variant: "warning" },
  critical: { label: "Crítico", variant: "danger" },
};

export const API_KEY_STATUS = {
  active: { label: "Ativa", variant: "success" },
  revoked: { label: "Revogada", variant: "neutral" },
};
