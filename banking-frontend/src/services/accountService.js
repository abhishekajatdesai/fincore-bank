import api from "./api";

export async function getAccount(accNo, token) {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const { data } = await api.get(`/account/${accNo}`, config);
    return data;
}

export async function getBalance(accNo, token) {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const { data } = await api.get(`/account/balance/${accNo}`, config);
    return data;
}
