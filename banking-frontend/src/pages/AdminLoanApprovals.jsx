import React, { useEffect, useState } from "react";
import { approveLoan, getPendingLoanRequests, rejectLoan } from "../services/adminService";

export default function AdminLoanApprovals() {
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const data = await getPendingLoanRequests();
    setLoans(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadData().catch((err) => setError(err?.response?.data?.message || err?.message || "Failed to load loans"));
  }, []);

  async function onApprove(loanId) {
    setLoading(true);
    setError("");
    try {
      await approveLoan(loanId, { interestRate: 11.5, note: "Approved by banking system" });
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Approve failed");
    } finally {
      setLoading(false);
    }
  }

  async function onReject(loanId) {
    setLoading(true);
    setError("");
    try {
      await rejectLoan(loanId, { note: "Rejected by banking system policy" });
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Reject failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Loan Approval Queue</h1>
        <p className="mt-2 text-sm text-slate-500">Only banking system/admin can approve or reject loan accounts.</p>
        {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="mt-6 space-y-3">
          {loans.length === 0 ? (
            <div className="text-sm text-slate-500">No pending loan requests.</div>
          ) : (
            loans.map((loan) => (
              <div key={loan.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm">
                  <div className="font-semibold text-slate-900">Loan #{loan.id} ({loan.loanType})</div>
                  <div className="text-slate-600">Account: {loan.accountNumber} | Amount: {loan.principalAmount}</div>
                  <div className="text-slate-500">Requested tenure: {loan.tenureMonths} months</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    onClick={() => onApprove(loan.id)}
                    disabled={loading}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    onClick={() => onReject(loan.id)}
                    disabled={loading}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
