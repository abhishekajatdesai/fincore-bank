import api from "./api";

export async function deposit(payload, token) {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const { data } = await api.post("/transaction/deposit", payload, config);
    return data;
}

export async function withdraw(payload, token) {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const { data } = await api.post("/transaction/withdraw", payload, config);
    return data;
}

export async function transfer(payload, token) {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const { data } = await api.post("/transaction/transfer", payload, config);
    return data;
}

export async function getTransactionHistory(accNo, token) {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const { data } = await api.get(`/transaction/history/${accNo}`, config);
    return data;
}

export async function downloadStatement(accNo, limit = 10) {
    const { data } = await api.get(`/transaction/statement/${accNo}`, {
        params: { limit },
        responseType: "blob"
    });
    return data;
}
