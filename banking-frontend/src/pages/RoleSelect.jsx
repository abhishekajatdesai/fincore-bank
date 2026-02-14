import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#dbeafe,_transparent_60%),radial-gradient(circle_at_bottom,_#fef3c7,_transparent_55%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            Secure banking platform
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Choose your workspace
          </h1>
          <p className="mt-4 text-base text-slate-600">
            Sign in as an admin to manage customers or as a customer to view
            balances and transactions.
          </p>
        </div>

        <div className="grid gap-6">
          <button
            className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-900"
            onClick={() => navigate("/admin-login")}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Admin
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              Admin Login
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Onboard customers, approve transactions, and monitor activity.
            </p>
          </button>

          <button
            className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-900"
            onClick={() => navigate("/customer-login")}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Customer
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              Customer Login
            </div>
            <p className="mt-2 text-sm text-slate-600">
              View balances, transfer money, and download statements.
            </p>
          </button>

          <button
            className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-900"
            onClick={() => navigate("/register")}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              New Customer
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              Create Account
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Register a customer account and receive a login username.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
