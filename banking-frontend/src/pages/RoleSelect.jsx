import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-76px)] bg-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="relative flex flex-col justify-center bg-slate-900 px-8 py-14 text-white lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.28),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.6),_transparent_65%)]" />
          <div className="relative">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold text-slate-100">
              Secure banking platform
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
              Fincore Bank
            </h1>
            <p className="mt-4 max-w-md text-base text-slate-200">
              Access role-based workspace for customer operations, account services,
              and banking approvals.
            </p>
          </div>
        </div>

        <div className="relative flex items-center px-6 py-14 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#dbeafe,_transparent_60%),radial-gradient(circle_at_bottom,_#fef3c7,_transparent_55%)]" />
          <div className="relative w-full grid gap-6">
            <h2 className="text-2xl font-semibold text-slate-900">Choose your workspace</h2>
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
    </div>
  );
}
