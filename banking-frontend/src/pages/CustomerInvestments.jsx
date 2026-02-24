import React, { useEffect, useState } from "react";
import {
  applyLoan,
  breakFixedDeposit,
  createFixedDeposit,
  downloadFixedDepositReceipt,
  downloadLoanSummary,
  getFixedDeposits,
  getLoans,
  repayLoan
} from "../services/customerService";

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default function CustomerInvestments() {
  const [activeSection, setActiveSection] = useState("FD");
  const [fdForm, setFdForm] = useState({ amount: "", tenureMonths: 12 });
  const [loanForm, setLoanForm] = useState({ loanType: "PERSONAL", amount: "", tenureMonths: 24 });
  const [repaymentFormByLoan, setRepaymentFormByLoan] = useState({});
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    const [fds, loanData] = await Promise.all([getFixedDeposits(), getLoans()]);
    setFixedDeposits(Array.isArray(fds) ? fds : []);
    setLoans(Array.isArray(loanData) ? loanData : []);
  }

  useEffect(() => {
    loadData().catch((err) => {
      setError(err?.response?.data?.message || err?.message || "Unable to load data");
    });
  }, []);

  async function submitFd(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await createFixedDeposit({
        amount: Number(fdForm.amount),
        tenureMonths: Number(fdForm.tenureMonths)
      });
      setSuccess("Fixed Deposit created");
      setFdForm({ amount: "", tenureMonths: 12 });
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "FD creation failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitLoan(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await applyLoan({
        loanType: loanForm.loanType,
        amount: Number(loanForm.amount),
        tenureMonths: Number(loanForm.tenureMonths)
      });
      setSuccess("Loan request submitted. Approval is done by banking system.");
      setLoanForm({ loanType: "PERSONAL", amount: "", tenureMonths: 24 });
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Loan application failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleBreakFd(fdId) {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await breakFixedDeposit(fdId);
      setSuccess(response?.message || "FD broken successfully");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to break FD");
    } finally {
      setLoading(false);
    }
  }

  async function handleFdReceipt(fdId) {
    setError("");
    try {
      const blob = await downloadFixedDepositReceipt(fdId);
      downloadBlob(blob, `FD_Receipt_${fdId}.pdf`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "FD receipt download failed");
    }
  }

  async function handleLoanSummary(loanId) {
    setError("");
    try {
      const blob = await downloadLoanSummary(loanId);
      downloadBlob(blob, `Loan_Summary_${loanId}.pdf`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Loan summary download failed");
    }
  }

  async function handleRepayLoan(loanId) {
    const form = repaymentFormByLoan[loanId] || { amount: "", pin: "" };
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await repayLoan(loanId, {
        amount: Number(form.amount),
        pin: form.pin
      });
      setSuccess(response?.message || "Loan repayment successful");
      setRepaymentFormByLoan((prev) => ({ ...prev, [loanId]: { amount: "", pin: "" } }));
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Loan repayment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            activeSection === "FD"
              ? "bg-sky-600 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
          onClick={() => setActiveSection("FD")}
          type="button"
        >
          Fixed Deposit Section
        </button>
        <button
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            activeSection === "LOAN"
              ? "bg-indigo-600 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
          onClick={() => setActiveSection("LOAN")}
          type="button"
        >
          Loan Section
        </button>
      </div>

      {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {success && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      {activeSection === "FD" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Open Fixed Deposit</h2>
            <p className="mt-1 text-xs text-slate-600">Book an FD and download a complete receipt PDF.</p>
            <form className="mt-4 space-y-3" onSubmit={submitFd}>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="FD amount"
                type="number"
                min="1"
                value={fdForm.amount}
                onChange={(e) => setFdForm((p) => ({ ...p, amount: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="Tenure months"
                type="number"
                min="1"
                value={fdForm.tenureMonths}
                onChange={(e) => setFdForm((p) => ({ ...p, tenureMonths: e.target.value }))}
                required
              />
              <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" disabled={loading}>
                Create FD
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">My Fixed Deposits</h3>
            <div className="mt-3 space-y-3 text-sm">
              {fixedDeposits.length === 0 ? (
                <div className="text-slate-500">No fixed deposits yet.</div>
              ) : (
                fixedDeposits.map((fd) => (
                  <div key={fd.id} className="rounded-xl border border-slate-200 px-3 py-3">
                    <div className="font-medium">FD #{fd.id} - {fd.status}</div>
                    <div>Amount: {fd.principalAmount} | Maturity: {fd.maturityAmount}</div>
                    <div>Rate: {fd.interestRate}% | Tenure: {fd.tenureMonths} months</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                        type="button"
                        onClick={() => handleFdReceipt(fd.id)}
                      >
                        Download FD PDF
                      </button>
                      {fd.status === "ACTIVE" && (
                        <button
                          className="rounded-xl bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
                          type="button"
                          onClick={() => handleBreakFd(fd.id)}
                          disabled={loading}
                        >
                          Break FD
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Apply Loan</h2>
            <p className="mt-1 text-xs text-slate-600">Apply for loan account. Approval is done by banking system/admin only.</p>
            <form className="mt-4 space-y-3" onSubmit={submitLoan}>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                value={loanForm.loanType}
                onChange={(e) => setLoanForm((p) => ({ ...p, loanType: e.target.value }))}
              >
                <option value="PERSONAL">Personal</option>
                <option value="HOME">Home</option>
                <option value="VEHICLE">Vehicle</option>
                <option value="EDUCATION">Education</option>
              </select>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="Loan amount"
                type="number"
                min="1"
                value={loanForm.amount}
                onChange={(e) => setLoanForm((p) => ({ ...p, amount: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="Tenure months"
                type="number"
                min="1"
                value={loanForm.tenureMonths}
                onChange={(e) => setLoanForm((p) => ({ ...p, tenureMonths: e.target.value }))}
                required
              />
              <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" disabled={loading}>
                Submit Loan Request
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-indigo-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">My Loan Requests</h3>
            <div className="mt-3 space-y-3 text-sm">
              {loans.length === 0 ? (
                <div className="text-slate-500">No loan requests yet.</div>
              ) : (
                loans.map((loan) => (
                  <div key={loan.id} className="rounded-xl border border-slate-200 px-3 py-3">
                    <div className="font-medium">Loan #{loan.id} - {loan.status}</div>
                    <div>{loan.loanType} | Amount: {loan.principalAmount}</div>
                    <div>EMI: {loan.emiAmount || 0} | Tenure: {loan.tenureMonths} months</div>
                    <div>Outstanding: {loan.outstandingAmount ?? loan.principalAmount}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                        type="button"
                        onClick={() => handleLoanSummary(loan.id)}
                      >
                        Download Loan PDF
                      </button>
                    </div>

                    {loan.status === "APPROVED" && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <input
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                          placeholder="Repay amount"
                          type="number"
                          min="1"
                          value={repaymentFormByLoan[loan.id]?.amount || ""}
                          onChange={(e) =>
                            setRepaymentFormByLoan((prev) => ({
                              ...prev,
                              [loan.id]: { ...prev[loan.id], amount: e.target.value }
                            }))
                          }
                        />
                        <input
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                          placeholder="PIN"
                          type="password"
                          value={repaymentFormByLoan[loan.id]?.pin || ""}
                          onChange={(e) =>
                            setRepaymentFormByLoan((prev) => ({
                              ...prev,
                              [loan.id]: { ...prev[loan.id], pin: e.target.value }
                            }))
                          }
                        />
                        <button
                          className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                          type="button"
                          onClick={() => handleRepayLoan(loan.id)}
                          disabled={loading}
                        >
                          Repay Loan
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
