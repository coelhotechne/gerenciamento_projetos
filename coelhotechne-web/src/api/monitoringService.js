import { mockLogs, mockAlerts, mockActivity, usageSeries, usagePerApp, levelWeight } from "../mocks/mockData";
import { simulateLatency, cloneDeep } from "./httpClient";

export const MOCK_MODE = true;

let _alerts = cloneDeep(mockAlerts);

// Em produção, esta redação deveria ocorrer no servidor (o token do
// solicitante já define o que ele pode ver). Aqui simulamos o mesmo
// comportamento no cliente para deixar a regra de RBAC visível.
function redactLog(log, canViewFull) {
  if (canViewFull) return log;
  return { ...log, ip: "•••.•••.•••.•••", userAgent: "oculto para o seu perfil" };
}

export async function listLogs({ appId = "all", level = "all", canViewFull = false } = {}) {
  await simulateLatency(320);
  return mockLogs
    .filter((l) => (appId === "all" ? true : l.appId === appId))
    .filter((l) => (level === "all" ? true : l.level === level))
    .sort((a, b) => levelWeight(b.level) - levelWeight(a.level) || new Date(b.timestamp) - new Date(a.timestamp))
    .map((l) => redactLog(l, canViewFull));
}

export async function listAlerts() {
  await simulateLatency(280);
  return [..._alerts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function acknowledgeAlert(id) {
  await simulateLatency(300);
  _alerts = _alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a));
  return _alerts.find((a) => a.id === id);
}

export async function getUsageSeries() {
  await simulateLatency(260);
  return usageSeries;
}

export async function getUsagePerApp() {
  await simulateLatency(260);
  return usagePerApp;
}

export async function getActivityFeed() {
  await simulateLatency(240);
  return mockActivity;
}
