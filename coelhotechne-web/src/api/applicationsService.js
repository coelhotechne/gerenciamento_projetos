import { mockApplications } from "../mocks/mockData";
import { simulateLatency, cloneDeep } from "./httpClient";

export const MOCK_MODE = true;

// estado em memória — simula o banco de dados enquanto não há API real.
// produção: GET/POST/PATCH/DELETE em `${baseURL}/applications`
let _applications = cloneDeep(mockApplications);

function genId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

export async function listApplications({ search = "", status = "all" } = {}) {
  await simulateLatency();
  return _applications
    .filter((app) => (status === "all" ? true : app.status === status))
    .filter((app) => app.name.toLowerCase().includes(search.toLowerCase()) || app.slug.includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function getApplication(id) {
  await simulateLatency(220);
  const app = _applications.find((a) => a.id === id);
  if (!app) throw new Error("Aplicação não encontrada.");
  return app;
}

export async function createApplication({ name, description, environment, owner, tags }) {
  await simulateLatency(500);
  const app = {
    id: genId("app"),
    name,
    slug: name.toLowerCase().trim().replace(/\s+/g, "-"),
    description: description || "",
    status: "active",
    environment: environment || "staging",
    version: "0.1.0",
    owner: owner || "—",
    tags: tags || [],
    url: "",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    versions: [{ version: "0.1.0", date: new Date().toISOString().slice(0, 10), notes: "Aplicação criada." }],
    apiKeys: [],
  };
  _applications = [app, ..._applications];
  return app;
}

export async function updateApplicationStatus(id, status) {
  await simulateLatency(300);
  _applications = _applications.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a));
  return _applications.find((a) => a.id === id);
}

export async function generateApiKey(appId) {
  await simulateLatency(450);
  const prefix = `sk_live_${Math.random().toString(16).slice(2, 6)}`;
  const secretOnce = `${prefix}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2, 10)}`;
  const key = {
    id: genId("key"),
    prefix,
    createdAt: new Date().toISOString().slice(0, 10),
    lastUsed: null,
    status: "active",
  };
  // apenas o prefixo é retido no "banco" — o segredo completo só existe
  // neste retorno único, exatamente como em uma API real.
  _applications = _applications.map((a) => (a.id === appId ? { ...a, apiKeys: [key, ...a.apiKeys] } : a));
  return { ...key, secretOnce };
}

export async function revokeApiKey(appId, keyId) {
  await simulateLatency(350);
  _applications = _applications.map((a) =>
    a.id === appId ? { ...a, apiKeys: a.apiKeys.map((k) => (k.id === keyId ? { ...k, status: "revoked" } : k)) } : a
  );
  return true;
}
