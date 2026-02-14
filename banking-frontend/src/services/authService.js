import api, { clearAuthToken, setAuthToken } from "./api";

export async function login(username, password) {
    const { data } = await api.post("/auth/login", { username, password });
    if (data?.token) setAuthToken(data.token);
    return data;
}

export async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data;
}

export async function changePassword(payload) {
    const { data } = await api.post("/auth/change-password", payload);
    return data;
}

export function logout() {
    clearAuthToken();
}
