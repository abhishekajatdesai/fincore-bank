import api from "./api";

export async function getProfile() {
  const { data } = await api.get("/customer/profile");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.put("/customer/profile", payload);
  return data;
}

export async function changePin(payload) {
  const { data } = await api.post("/customer/change-pin", payload);
  return data;
}

export async function getActivity(limit = 10) {
  const { data } = await api.get("/customer/activity", { params: { limit } });
  return data;
}

export async function createFixedDeposit(payload) {
  const { data } = await api.post("/customer/fixed-deposits", payload);
  return data;
}

export async function getFixedDeposits() {
  const { data } = await api.get("/customer/fixed-deposits");
  return data;
}

export async function applyLoan(payload) {
  const { data } = await api.post("/customer/loans/apply", payload);
  return data;
}

export async function getLoans() {
  const { data } = await api.get("/customer/loans");
  return data;
}

export async function breakFixedDeposit(fdId) {
  const { data } = await api.post(`/customer/fixed-deposits/${fdId}/break`);
  return data;
}

export async function downloadFixedDepositReceipt(fdId) {
  const { data } = await api.get(`/customer/fixed-deposits/${fdId}/receipt`, {
    responseType: "blob"
  });
  return data;
}

export async function repayLoan(loanId, payload) {
  const { data } = await api.post(`/customer/loans/${loanId}/repay`, payload);
  return data;
}

export async function downloadLoanSummary(loanId) {
  const { data } = await api.get(`/customer/loans/${loanId}/summary`, {
    responseType: "blob"
  });
  return data;
}
