import React, { useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const linkBase =
  "px-3 py-2 rounded-full text-sm font-medium transition-colors";

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:text-slate-900 hover:bg-white/70"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { isAuthenticated, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute =
    location.pathname === "/" ||
    location.pathname === "/admin-login" ||
    location.pathname === "/customer-login" ||
    location.pathname === "/register";
  const isAdmin = role?.toUpperCase?.().includes("ADMIN");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow">
            F
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">
              Fincore Bank
            </div>
            <div className="text-xs text-slate-500">
              Modern banking workspace
            </div>
          </div>
        </div>

        {!isAuthRoute && (
          <nav className="hidden items-center gap-2 md:flex">
            {isAdmin ? (
              <>
                <NavItem to="/admin" label="Admin" />
                <NavItem to="/create-customer" label="Create Customer" />
                <NavItem to="/admin/accounts" label="Accounts" />
                <NavItem to="/admin/reset" label="Reset Access" />
                <NavItem to="/admin/audit" label="Audit Log" />
              </>
            ) : (
              <>
                <NavItem to="/customer" label="Overview" />
                <NavItem to="/customer/profile" label="Profile" />
                <NavItem to="/transfer" label="Transfer" />
                <NavItem to="/transactions" label="Transactions" />
              </>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-800 hover:text-slate-900"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          ) : (
            <button
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
              onClick={() => navigate("/")}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
