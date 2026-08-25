import { jwtDecode } from "jwt-decode";
import { mockUsers } from "../mocks/mockData";
import { simulateLatency } from "./httpClient";

// ---------------------------------------------------------------------------
// MOCK_MODE = true: autentica contra a lista local `mockUsers` e emite um
// token no formato JWT (header.payload.assinatura) apenas para fins de
// demonstração — a "assinatura" não é criptograficamente válida.
//
// Quando a API real existir, troque para MOCK_MODE = false: as funções abaixo
// passam a chamar POST /auth/login, POST /auth/refresh e POST /auth/logout
// em httpClient, mantendo a mesma assinatura (login, refresh, logout).
// ---------------------------------------------------------------------------
export const MOCK_MODE = true;

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutos, típico para access token

function base64url(obj) {
  return btoa(JSON.stringify(obj)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function createMockToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
  };
  // assinatura simulada — NÃO usar este padrão em produção
  const fakeSignature = base64url({ mock: true });
  return `${base64url(header)}.${base64url(payload)}.${fakeSignature}`;
}

export async function login({ email, password }) {
  await simulateLatency(500);

  const user = mockUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase());

  if (!user) {
    throw new AuthError("Credenciais inválidas. Verifique o e-mail e a senha.");
  }
  if (user.status === "suspended") {
    throw new AuthError("Este usuário está suspenso. Contate um administrador.");
  }
  if (!password || password.length < 3) {
    throw new AuthError("Credenciais inválidas. Verifique o e-mail e a senha.");
  }

  const accessToken = createMockToken(user);
  const claims = jwtDecode(accessToken);
  return { user: sanitizeUser(user), accessToken, expiresAt: claims.exp * 1000 };
}

export async function loginAsDemo(userId) {
  await simulateLatency(300);
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new AuthError("Conta de demonstração não encontrada.");
  const accessToken = createMockToken(user);
  const claims = jwtDecode(accessToken);
  return { user: sanitizeUser(user), accessToken, expiresAt: claims.exp * 1000 };
}

export async function refresh(currentUserId) {
  await simulateLatency(250);
  const user = mockUsers.find((u) => u.id === currentUserId);
  if (!user) throw new AuthError("Sessão inválida. Faça login novamente.");
  const accessToken = createMockToken(user);
  const claims = jwtDecode(accessToken);
  return { accessToken, expiresAt: claims.exp * 1000 };
}

export async function logout() {
  await simulateLatency(150);
  // produção: POST /auth/logout para revogar o refresh token no servidor
  return true;
}

function sanitizeUser(user) {
  const { name, email, id, role, status } = user;
  return { id, name, email, role, status };
}

export class AuthError extends Error {}
