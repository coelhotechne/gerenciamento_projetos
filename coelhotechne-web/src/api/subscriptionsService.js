import { mockSubscriptions } from "../mocks/mockData";
import { simulateLatency } from "./httpClient";

export const MOCK_MODE = true;

// produção: GET `${baseURL}/subscriptions`
export async function listSubscriptions() {
  await simulateLatency();
  return [...mockSubscriptions].sort((a, b) => new Date(a.nextBilling || 0) - new Date(b.nextBilling || 0));
}

export async function getSubscription(id) {
  await simulateLatency(220);
  const sub = mockSubscriptions.find((s) => s.id === id);
  if (!sub) throw new Error("Assinatura não encontrada.");
  return sub;
}
