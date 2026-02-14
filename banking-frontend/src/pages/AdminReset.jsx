import React, { useState } from "react";
import {
  initiatePasswordReset,
  confirmPasswordReset,
  initiatePinReset,
  confirmPinReset
} from "../services/adminService";

export default function AdminReset() {
  const [passwordUsername, setPasswordUsername] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const [pinAccount, setPinAccount] = useState("");
  const [pinOtp, setPinOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");

  async function handlePasswordInitiate() {
    setPasswordMsg("");
    const res = await initiatePasswordReset(passwordUsername);
    setPasswordMsg(res?.otp ? `OTP (simulated): ${res.otp}` : res?.message);
  }

  async function handlePasswordConfirm() {
    setPasswordMsg("");
    const res = await confirmPasswordReset({
      username: passwordUsername,
      otp: passwordOtp,
      newPassword
    });
    setPasswordMsg(res?.message || "Done");
  }

  async function handlePinInitiate() {
    setPinMsg("");
    const res = await initiatePinReset(Number(pinAccount));
    setPinMsg(res?.otp ? `OTP (simulated): ${res.otp}` : res?.message);
  }

  async function handlePinConfirm() {
    setPinMsg("");
    const res = await confirmPinReset({
      accountNumber: Number(pinAccount),
      otp: pinOtp,
      newPin
    });
    setPinMsg(res?.message || "Done");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Reset Customer Password
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Simulated OTP flow (OTP shown here for demo).
          </p>

          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="Username (email)"
              value={passwordUsername}
              onChange={(event) => setPasswordUsername(event.target.value)}
            />
            <button
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={handlePasswordInitiate}
            >
              Generate OTP
            </button>

            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="OTP"
              value={passwordOtp}
              onChange={(event) => setPasswordOtp(event.target.value)}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="New password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
            />
            <button
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={handlePasswordConfirm}
            >
              Confirm Reset
            </button>
            {passwordMsg && (
              <div className="text-xs text-slate-600">{passwordMsg}</div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Reset Customer PIN
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Simulated OTP flow (OTP shown here for demo).
          </p>

          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="Account number"
              value={pinAccount}
              onChange={(event) => setPinAccount(event.target.value)}
            />
            <button
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={handlePinInitiate}
            >
              Generate OTP
            </button>

            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="OTP"
              value={pinOtp}
              onChange={(event) => setPinOtp(event.target.value)}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="New PIN"
              value={newPin}
              onChange={(event) => setNewPin(event.target.value)}
              type="password"
            />
            <button
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={handlePinConfirm}
            >
              Confirm Reset
            </button>
            {pinMsg && <div className="text-xs text-slate-600">{pinMsg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
