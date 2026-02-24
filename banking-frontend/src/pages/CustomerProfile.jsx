import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, changePin } from "../services/customerService";
import { changePassword } from "../services/authService";

export default function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [showSensitive, setShowSensitive] = useState(
    () => window.localStorage.getItem("fincore_show_sensitive") === "true"
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [pinForm, setPinForm] = useState({ oldPin: "", newPin: "" });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function maskAccountNumber(value) {
    if (!value) return "—";
    const str = String(value);
    if (str.length <= 4) return str;
    return `${"x".repeat(Math.max(0, str.length - 4))}${str.slice(-4)}`;
  }

  function maskEmail(value) {
    if (!value) return "No email";
    const [user, domain] = value.split("@");
    if (!domain) return "xxxxx";
    const safeUser = user.length <= 2 ? `${user[0] || "x"}x` : `${user.slice(0, 2)}xxx`;
    return `${safeUser}@${domain}`;
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getProfile();
        setProfile(data);
        setBalance(data?.balance ?? 0);
        setForm({
          name: data?.customer?.name || "",
          email: data?.customer?.email || "",
          phone: data?.customer?.phone || "",
          address: data?.customer?.address || ""
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("fincore_show_sensitive", String(showSensitive));
  }, [showSensitive]);

  async function handleSaveProfile() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await updateProfile(form);
      setProfile(data);
      setSuccess("Profile updated");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Update failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePin() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await changePin(pinForm);
      if (!data?.success) {
        setError(data?.message || "PIN change failed");
      } else {
        setSuccess(data.message);
        setPinForm({ oldPin: "", newPin: "" });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "PIN change failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await changePassword(passwordForm);
      if (!data?.success) {
        setError(data?.message || "Password change failed");
      } else {
        setSuccess(data.message);
        setPasswordForm({ oldPassword: "", newPassword: "" });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Password change failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Customer Profile
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Identity, account status, and balance details.
            </p>
          </div>
          <button
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
            onClick={() => setShowSensitive((prev) => !prev)}
            type="button"
          >
            {showSensitive ? "Hide Details" : "View Details"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-xl font-semibold text-white">
                {(profile?.customer?.name || "C").slice(0, 1)}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {profile?.customer?.name || "Customer Name"}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <span>{showSensitive ? (profile?.customer?.email || "customer@email.com") : maskEmail(profile?.customer?.email)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: "Account Number",
                  value: maskAccountNumber(profile?.accountNumber)
                },
                { label: "Account Type", value: profile?.accountType || "—" }
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Name", field: "name" },
                { label: "Email", field: "email" },
                { label: "Phone", field: "phone" },
                { label: "Address", field: "address" }
              ].map((item) => (
                <div key={item.field}>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {item.label}
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    value={form[item.field]}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [item.field]: event.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            <button
              className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save profile"}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Balance Overview
            </div>
            <div className="mt-4 text-3xl font-semibold text-slate-900">
              {showSensitive ? (balance ?? "—") : "xxxxx"}
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Last updated just now
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {profile?.status || "Active"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Risk flag</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {profile?.risk || "Low"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last KYC</span>
                <span>{profile?.kycUpdatedAt || "—"}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Change PIN
              </div>
              <div className="mt-3 grid gap-3">
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="Old PIN"
                  value={pinForm.oldPin}
                  onChange={(event) =>
                    setPinForm((prev) => ({ ...prev, oldPin: event.target.value }))
                  }
                  type="password"
                />
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="New PIN"
                  value={pinForm.newPin}
                  onChange={(event) =>
                    setPinForm((prev) => ({ ...prev, newPin: event.target.value }))
                  }
                  type="password"
                />
                <button
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  onClick={handleChangePin}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update PIN"}
                </button>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Change Password
              </div>
              <div className="mt-3 grid gap-3">
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="Old password"
                  value={passwordForm.oldPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))
                  }
                  type="password"
                />
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                  type="password"
                />
                <button
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
