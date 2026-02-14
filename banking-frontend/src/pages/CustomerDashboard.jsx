import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getProfile, getActivity } from "../services/customerService";

export default function CustomerDashboard() {
  const { accountNo, setAccountNo } = useContext(AuthContext);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const profile = await getProfile();
        setAccount(profile);
        setBalance(profile?.balance ?? 0);
        setAccountNo(profile?.accountNumber);
        const recent = await getActivity(5);
        setActivity(Array.isArray(recent) ? recent : []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load account"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Customer Dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                View balances and initiate transactions quickly.
              </p>
            </div>
            <div className="text-sm text-slate-500">
              Account: {accountNo || "—"}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current Balance
            </div>
            <div className="mt-4 text-3xl font-semibold text-slate-900">
              {balance ?? "—"}
            </div>
            <div className="mt-2 text-sm text-slate-500">Live ledger</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account Type
            </div>
            <div className="mt-4 text-2xl font-semibold text-slate-900">
              {account?.accountType || "—"}
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {account?.status || "Status pending"}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account Holder
            </div>
            <div className="mt-4 text-2xl font-semibold text-slate-900">
              {account?.customer?.name || "—"}
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {account?.customer?.email || "No email"}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Transfer", to: "/transfer" },
            { label: "Transactions", to: "/transactions" }
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Account Details
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Account Number", value: account?.accountNumber || accountNo },
                { label: "Branch", value: account?.branch || "Main Branch" },
                { label: "IFSC", value: account?.ifsc || "FINC0001" },
                { label: "Opened", value: account?.openedAt || "—" }
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                >
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {item.label}
                  </div>
                  <div className="mt-1 font-semibold text-slate-700">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Activity
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {activity.length === 0 ? (
                <div className="text-sm text-slate-500">No activity yet.</div>
              ) : (
                activity.map((tx) => (
                  <div
                    key={tx.transactionId}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="font-semibold text-slate-700">
                      {tx.txType}
                    </div>
                    <div className="text-xs text-slate-500">
                      {tx.txTime} · {tx.amount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
