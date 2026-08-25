import { mockUsers, mockApplications } from "../mocks/mockData";
import { ROLES } from "../auth/permissions";
import { simulateLatency, cloneDeep } from "./httpClient";

export const MOCK_MODE = true;

// produção: GET/POST/PATCH em `${baseURL}/users`
let _users = cloneDeep(mockUsers);

function genId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2, 8)}`;
}

export async function listUsers() {
  await simulateLatency();
  return [..._users].sort((a, b) => a.name.localeCompare(b.name));
}

export async function inviteUser({ name, email, role, apps }) {
  await simulateLatency(500);
  if (_users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Já existe um usuário com este e-mail.");
  }
  const user = {
    id: genId("usr"),
    name: name || email.split("@")[0],
    email,
    role: role || ROLES.VIEWER,
    status: "invited",
    lastAccess: null,
    apps: apps || [],
  };
  _users = [user, ..._users];
  return user;
}

export async function updateUserAccess(id, { role, apps }) {
  await simulateLatency(400);
  _users = _users.map((u) => (u.id === id ? { ...u, role: role ?? u.role, apps: apps ?? u.apps } : u));
  return _users.find((u) => u.id === id);
}

export async function setUserStatus(id, status) {
  await simulateLatency(350);
  _users = _users.map((u) => (u.id === id ? { ...u, status } : u));
  return _users.find((u) => u.id === id);
}

export function applicationOptions() {
  return mockApplications.map((a) => ({ id: a.id, name: a.name }));
}
