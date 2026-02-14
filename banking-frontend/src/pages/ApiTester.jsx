import React, { useMemo, useState } from "react";
import { login, logout } from "../services/authService";
import { createCustomer } from "../services/adminService";
import { getAccount, getBalance } from "../services/accountService";
import {
  deposit,
  withdraw,
  transfer,
  getTransactionHistory
} from "../services/transactionService";
import { clearAuthToken, getAuthToken } from "../services/api";

const sectionStyle = {
  background: "white",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db"
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  cursor: "pointer"
};

const secondaryButtonStyle = {
  ...buttonStyle,
  border: "1px solid #6b7280",
  background: "white",
  color: "#111827"
};

export default function ApiTester() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accNo, setAccNo] = useState("");
  const [token, setToken] = useState(getAuthToken() || "");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultCreateCustomer = useMemo(
    () =>
      JSON.stringify(
        {
          name: "Test User",
          email: "test@example.com",
          phone: "9999999999",
          address: "Test City",
          initialDeposit: 1000,
          accountType: "SAVINGS"
        },
        null,
        2
      ),
    []
  );

  const defaultDeposit = useMemo(
    () =>
      JSON.stringify(
        {
          accNo: "1234567890",
          amount: 500
        },
        null,
        2
      ),
    []
  );

  const defaultWithdraw = useMemo(
    () =>
      JSON.stringify(
        {
          accNo: "1234567890",
          amount: 200
        },
        null,
        2
      ),
    []
  );

  const defaultTransfer = useMemo(
    () =>
      JSON.stringify(
        {
          fromAccNo: "1234567890",
          toAccNo: "9876543210",
          amount: 100
        },
        null,
        2
      ),
    []
  );

  const [createCustomerPayload, setCreateCustomerPayload] =
    useState(defaultCreateCustomer);
  const [depositPayload, setDepositPayload] = useState(defaultDeposit);
  const [withdrawPayload, setWithdrawPayload] = useState(defaultWithdraw);
  const [transferPayload, setTransferPayload] = useState(defaultTransfer);

  async function handleRequest(action) {
    try {
      setLoading(true);
      const data = await action();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(
        JSON.stringify(
          {
            error: error?.response?.data || error?.message || "Request failed"
          },
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "980px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
        API Tester
      </h1>

      <div style={{ marginBottom: "16px", ...sectionStyle }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
          Auth
        </h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
        >
          <input
            style={inputStyle}
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
          <button
            style={buttonStyle}
            disabled={loading}
            onClick={() =>
              handleRequest(async () => {
                const data = await login(username, password);
                const tokenFromLogin = data?.token || "";
                setToken(tokenFromLogin || getAuthToken() || "");
                return data;
              })
            }
          >
            Login
          </button>
          <button
            style={secondaryButtonStyle}
            disabled={loading}
            onClick={() => {
              logout();
              clearAuthToken();
              setToken("");
              setResponse("Logged out.");
            }}
          >
            Logout
          </button>
        </div>
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#6b7280" }}>
          Token in storage: {token ? "Present" : "Missing"}
        </div>
      </div>

      <div style={{ marginBottom: "16px", ...sectionStyle }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
          Admin: Create Customer
        </h2>
        <textarea
          style={{ ...inputStyle, minHeight: "120px", fontFamily: "monospace" }}
          value={createCustomerPayload}
          onChange={(event) => setCreateCustomerPayload(event.target.value)}
        />
        <div style={{ marginTop: "10px" }}>
          <button
            style={buttonStyle}
            disabled={loading}
            onClick={() =>
              handleRequest(() =>
                createCustomer(JSON.parse(createCustomerPayload))
              )
            }
          >
            Create Customer
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "16px", ...sectionStyle }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
          Account
        </h2>
        <input
          style={inputStyle}
          placeholder="Account Number"
          value={accNo}
          onChange={(event) => setAccNo(event.target.value)}
        />
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button
            style={buttonStyle}
            disabled={loading}
            onClick={() => handleRequest(() => getAccount(accNo))}
          >
            Get Account
          </button>
          <button
            style={secondaryButtonStyle}
            disabled={loading}
            onClick={() => handleRequest(() => getBalance(accNo))}
          >
            Get Balance
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "16px", ...sectionStyle }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
          Transaction: Deposit
        </h2>
        <textarea
          style={{ ...inputStyle, minHeight: "100px", fontFamily: "monospace" }}
          value={depositPayload}
          onChange={(event) => setDepositPayload(event.target.value)}
        />
        <div style={{ marginTop: "10px" }}>
          <button
            style={buttonStyle}
            disabled={loading}
            onClick={() => handleRequest(() => deposit(JSON.parse(depositPayload)))}
          >
            Deposit
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "16px", ...sectionStyle }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
          Transaction: Withdraw
        </h2>
        <textarea
          style={{ ...inputStyle, minHeight: "100px", fontFamily: "monospace" }}
          value={withdrawPayload}
          onChange={(event) => setWithdrawPayload(event.target.value)}
        />
        <div style={{ marginTop: "10px" }}>
          <button
            style={buttonStyle}
            disabled={loading}
            onClick={() =>
              handleRequest(() => withdraw(JSON.parse(withdrawPayload)))
            }
          >
            Withdraw
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "16px", ...sectionStyle }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
          Transaction: Transfer
        </h2>
        <textarea
          style={{ ...inputStyle, minHeight: "110px", fontFamily: "monospace" }}
          value={transferPayload}
          onChange={(event) => setTransferPayload(event.target.value)}
        />
        <div style={{ marginTop: "10px" }}>
          <button
            style={buttonStyle}
            disabled={loading}
            onClick={() =>
              handleRequest(() => transfer(JSON.parse(transferPayload)))
            }
          >
            Transfer
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "16px", ...sectionStyle }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
          Transaction History
        </h2>
        <input
          style={inputStyle}
          placeholder="Account Number"
          value={accNo}
          onChange={(event) => setAccNo(event.target.value)}
        />
        <div style={{ marginTop: "10px" }}>
          <button
            style={buttonStyle}
            disabled={loading}
            onClick={() => handleRequest(() => getTransactionHistory(accNo))}
          >
            Get History
          </button>
        </div>
      </div>

      <div style={{ ...sectionStyle }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
          Response
        </h2>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            fontSize: "13px"
          }}
        >
          {response || "No response yet."}
        </pre>
      </div>
    </div>
  );
}
