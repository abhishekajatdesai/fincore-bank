import api from "./api";

export async function createCustomer(payload, token) {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  const { data } = await api.post("/admin/create-customer", payload, config);
  return data;
}

export async function getAdminStats() {
  const { data } = await api.get("/admin/stats");
  return data;
}

export async function searchAccounts(query) {
  const { data } = await api.get("/admin/accounts", {
    params: query ? { query } : {}
  });
  return data;
}

export async function getAuditLogs() {
  const { data } = await api.get("/admin/audit");
  return data;
}

export async function initiatePasswordReset(username) {
  const { data } = await api.post("/admin/reset-password/initiate", { username });
  return data;
}

export async function confirmPasswordReset(payload) {
  const { data } = await api.post("/admin/reset-password/confirm", payload);
  return data;
}

export async function initiatePinReset(accountNumber) {
  const { data } = await api.post("/admin/reset-pin/initiate", { accountNumber });
  return data;
}

export async function confirmPinReset(payload) {
  const { data } = await api.post("/admin/reset-pin/confirm", payload);
  return data;
}
