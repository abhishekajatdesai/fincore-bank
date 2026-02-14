import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../services/adminService";

const alerts = [
  {
    title: "High-value transfer pending review",
    detail: "Transfer #TX-49821 requires approval."
  },
  {
    title: "3 accounts need KYC refresh",
    detail: "Last verified > 12 months ago."
  },
  {
    title: "Liquidity threshold reached",
    detail: "Cash reserve below 18%."
  }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch {
        setStats(null);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl bg-[radial-gradient(circle_at_top,_#0f172a,_#1e293b_60%,_#0f172a)] p-8 text-white shadow-xl">
          <h1 className="text-3xl font-semibold">Admin Command Center</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-200">
            Review customer onboarding, approve transactions, and monitor
            balances in real time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/create-customer"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow"
            >
              Create Customer
            </Link>
            <Link
              to="/transactions"
              className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white"
            >
              View Transactions
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Total Customers",
              value: stats?.totalCustomers ?? "—"
            },
            {
              label: "Active Accounts",
              value: stats?.totalAccounts ?? "—"
            },
            {
              label: "Today's Transfers",
              value: stats?.todayTransfers ?? "—"
            }
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stat.label}
              </div>
              <div className="mt-4 text-3xl font-semibold text-slate-900">
                {stat.value}
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Live from database
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Transaction Volume
              </h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                +12% vs last week
              </span>
            </div>
            <div className="mt-6 grid grid-cols-6 gap-3">
              {[40, 55, 70, 45, 90, 65, 80, 50, 62, 78, 58, 92].map(
                (value, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className="h-32 w-6 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="w-full rounded-full bg-slate-900"
                        style={{ height: `${value}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      W{index + 1}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Priority Alerts
            </h2>
            <div className="mt-4 space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.title}
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                >
                  <div className="font-semibold">{alert.title}</div>
                  <div className="mt-1 text-xs text-amber-700">
                    {alert.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Admin Actions
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Quickly jump to operational tasks.
            </p>
            <div className="mt-4 grid gap-3">
              <Link
                to="/create-customer"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-900"
              >
                Onboard a new customer
              </Link>
              <Link
                to="/admin/accounts"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-900"
              >
                Search accounts
              </Link>
              <Link
                to="/deposit"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-900"
              >
                Record a deposit
              </Link>
              <Link
                to="/transfer"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-900"
              >
                Transfer between accounts
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              System Summary
            </h2>
            <div className="mt-4 space-y-3">
              {[
                {
                  label: "Today's Transactions",
                  value: stats?.todayTransactions ?? "—"
                },
                {
                  label: "Total Balance",
                  value: stats?.totalBalance ?? "—"
                }
              ].map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                >
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      {entry.label}
                    </div>
                    <div className="font-semibold text-slate-700">
                      {entry.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                to="/admin/audit"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                View audit log →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
