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
