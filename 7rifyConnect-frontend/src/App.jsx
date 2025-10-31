// src/App.jsx
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from "react-router-dom";
import Logo from "./components/Logo";
import Home from "./pages/Home";
import HomeSearch from "./pages/HomeSearch";
import TechnicianProfile from "./pages/TechnicianProfile";
import CreateRequest from "./pages/CreateRequest";
import MyRequests from "./pages/MyRequests";
import TechDashboard from "./pages/TechDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatWindow from "./components/ChatWindow";
import UserProfile from "./pages/UserProfile";
import TechSelfProfile from "./pages/TechSelfProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/auth";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  // استخدم selectors منفصلة (أكثر استقراراً)
  const user   = useAuthStore((s) => s.user);
  const token  = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const role   = user?.role;

  return (
    <BrowserRouter>
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70"
        dir="rtl"
      >
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" aria-label="الرئيسية" className="flex items-center gap-2">
            <Logo className="!gap-2" />
          </Link>

          <nav className="text-sm text-slate-700 flex items-center gap-5">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `group relative pb-1 transition-colors ${
                  isActive ? "text-brand-700" : "hover:text-brand-700"
                } after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-right rtl:after:origin-left after:scale-x-0 ${
                  isActive ? "after:scale-x-100" : "group-hover:after:scale-x-100"
                } after:rounded-full after:bg-brand-500 motion-safe:after:transition-transform`
              }
            >
              البحث
            </NavLink>

            {token && (
              <NavLink
                to="/requests"
                className={({ isActive }) =>
                  `group relative pb-1 transition-colors ${
                    isActive ? "text-brand-700" : "hover:text-brand-700"
                  } after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-right rtl:after:origin-left after:scale-x-0 ${
                    isActive ? "after:scale-x-100" : "group-hover:after:scale-x-100"
                  } after:rounded-full after:bg-brand-500 motion-safe:after:transition-transform`
                }
              >
                طلباتي
              </NavLink>
            )}

            {role === "technicien" && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `group relative pb-1 transition-colors ${
                    isActive ? "text-brand-700" : "hover:text-brand-700"
                  } after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-right rtl:after:origin-left after:scale-x-0 ${
                    isActive ? "after:scale-x-100" : "group-hover:after:scale-x-100"
                  } after:rounded-full after:bg-brand-500 motion-safe:after:transition-transform`
                }
              >
                لوحة الحرفي
              </NavLink>
            )}

            {role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `group relative pb-1 transition-colors ${
                    isActive ? "text-brand-700" : "hover:text-brand-700"
                  } after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-right rtl:after:origin-left after:scale-x-0 ${
                    isActive ? "after:scale-x-100" : "group-hover:after:scale-x-100"
                  } after:rounded-full after:bg-brand-500 motion-safe:after:transition-transform`
                }
              >
                الإدارة
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="text-sm text-slate-700 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-2xl px-2 py-1"
                >
                  دخول
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-white bg-brand-600 px-3 py-1.5 rounded-2xl hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 shadow-sm"
                >
                  حساب جديد
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to={role === "technicien" ? "/me/tech" : "/me"}
                  className={({ isActive }) =>
                    `text-sm px-3 py-1.5 rounded-2xl border ${
                      isActive
                        ? "border-brand-300 text-brand-700"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  ملفي
                </NavLink>
                <NavLink
                  to="/chat"
                  className={({ isActive }) =>
                    `text-sm px-3 py-1.5 rounded-2xl border ${
                      isActive
                        ? "border-brand-300 text-brand-700"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  دردشة
                </NavLink>
                <button
                  onClick={logout}
                  className="text-sm text-white bg-slate-700 px-3 py-1.5 rounded-2xl hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 shadow-sm"
                >
                  خروج
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-0 min-h-[60vh]" dir="rtl">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<HomeSearch />} />
            <Route path="/technicians/:id" element={<TechnicianProfile />} />
            <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/chat/:threadId?" element={<ChatWindow />} />

            {/* /me */}
            <Route
              path="/me"
              element={
                <ProtectedRoute>
                  {role === "technicien" ? <Navigate to="/me/tech" replace /> : <UserProfile />}
                </ProtectedRoute>
              }
            />

            {/* Tech self profile */}
            <Route
              path="/me/tech"
              element={
                <ProtectedRoute role="technicien">
                  <TechSelfProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <MyRequests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="technicien">
                  <TechDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
