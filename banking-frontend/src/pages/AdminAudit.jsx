import React, { useEffect, useState } from "react";
import { getAuditLogs } from "../services/adminService";

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getAuditLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load audit logs"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Audit Log</h1>
        <p className="mt-2 text-sm text-slate-500">
          Recent system activity.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-sm text-slate-500">No logs found.</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
              >
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {log.action}
                  </div>
                  <div className="font-semibold text-slate-700">
                    {log.detail}
                  </div>
                  <div className="text-xs text-slate-500">
                    {log.actor} · {log.createdAt}
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    log.status === "Success"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
