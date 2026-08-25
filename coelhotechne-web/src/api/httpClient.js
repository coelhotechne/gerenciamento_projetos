import axios from "axios";

// ---------------------------------------------------------------------------
// Cliente HTTP central. Quando a API de gerenciamento de aplicações
// (derivada do erp_saas_storage) estiver no ar, defina REACT_APP_API_URL
// no .env e troque `MOCK_MODE` para false nos arquivos de src/api/*Service.js
// — nenhuma tela precisa mudar, pois todas consomem os services, não o
// axios diretamente.
// ---------------------------------------------------------------------------

export const httpClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// injeta o access token (Bearer) em toda requisição
let getAccessToken = () => null;
export function registerTokenGetter(fn) {
  getAccessToken = fn;
}

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// em caso de 401, tenta renovar a sessão uma única vez antes de desistir
let onUnauthorized = () => {};
export function registerUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

// pequeno atraso artificial para simular latência de rede no modo mock
export function simulateLatency(ms = 380) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value));
}
