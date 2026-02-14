import React, { useState } from "react";
import { getTransactionHistory, downloadStatement } from "../services/transactionService";

export default function Transactions() {
  const [accNo, setAccNo] = useState(
    localStorage.getItem("fincore_account") || ""
  );
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [downloading, setDownloading] = useState(false);

  async function handleFetch() {
    setLoading(true);
    setError("");

    try {
      const data = await getTransactionHistory(accNo);
      setTransactions(Array.isArray(data) ? data : data?.transactions || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setError("");
    try {
      const blob = await downloadStatement(accNo, 10);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Statement_${accNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to download statement"
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Transactions
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review transaction history for an account.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              placeholder="Account Number"
              value={accNo}
              onChange={(event) => {
                setAccNo(event.target.value);
                localStorage.setItem("fincore_account", event.target.value);
              }}
            />
            <button
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              onClick={handleFetch}
              disabled={!accNo || loading}
            >
              {loading ? "Loading..." : "Fetch history"}
            </button>
            <button
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow hover:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200"
              onClick={handleDownload}
              disabled={!accNo || downloading}
            >
              {downloading ? "Preparing..." : "Download statement"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {["ALL", "DEPOSIT", "WITHDRAW", "TRANSFER_IN", "TRANSFER_OUT"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                filter === type
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Counterparty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-400"
                    colSpan={8}
                  >
                    No transactions loaded.
                  </td>
                </tr>
              ) : (
                transactions
                  .filter((tx) => {
                    if (filter === "ALL") return true;
                    const type = (tx?.txType || "").toUpperCase();
                    return type.includes(filter);
                  })
                  .map((tx, index) => (
                  <tr key={tx?.transactionId || index}>
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {tx?.txType || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {tx?.accountNumber ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {tx?.accountName || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {tx?.amount ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {tx?.description || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {tx?.counterpartyName
                        ? `${tx.counterpartyName} (${tx.counterpartyAccount})`
                        : tx?.counterpartyAccount || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          (tx?.status || "Completed") === "Completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {tx?.status || "Completed"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {tx?.txTime || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
