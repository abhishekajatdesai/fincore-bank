import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RoleSelect from "./pages/RoleSelect";
import AdminDashboard from "./pages/AdminDashboard";
import CreateCustomer from "./pages/CreateCustomer";
import CustomerDashboard from "./pages/CustomerDashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import CustomerProfile from "./pages/CustomerProfile";
import Register from "./pages/Register";
import AdminAccounts from "./pages/AdminAccounts";
import AdminAudit from "./pages/AdminAudit";
import AdminReset from "./pages/AdminReset";
import CustomerInvestments from "./pages/CustomerInvestments";
import AdminLoanApprovals from "./pages/AdminLoanApprovals";
import Navbar from "./components/layout/Navbar";
import { AuthContext } from "./context/AuthContext";

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, role } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/" />;
  if (roles && !roles.some((r) => role?.toUpperCase?.().includes(r))) {
    return <Navigate to="/" />;
  }
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/admin-login" element={<Login roleTarget="ADMIN" />} />
        <Route path="/customer-login" element={<Login roleTarget="CUSTOMER" />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-customer"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <CreateCustomer />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <AdminAccounts />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <AdminAudit />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reset"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <AdminReset />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/loans"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <AdminLoanApprovals />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer"
          element={
            <PrivateRoute roles={["CUSTOMER"]}>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <PrivateRoute roles={["CUSTOMER"]}>
              <CustomerProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/investments"
          element={
            <PrivateRoute roles={["CUSTOMER"]}>
              <CustomerInvestments />
            </PrivateRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <Deposit />
            </PrivateRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <Withdraw />
            </PrivateRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <PrivateRoute roles={["ADMIN", "CUSTOMER"]}>
              <Transfer />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute roles={["ADMIN", "CUSTOMER"]}>
              <Transactions />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
