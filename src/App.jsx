import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/auth";

export default function App() {
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const prefersReducedMotion = useReducedMotion();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <BrowserRouter>
      <motion.header
        dir="rtl"
        initial={prefersReducedMotion ? false : { y: -24, opacity: 0 }}
        animate={prefersReducedMotion ? undefined : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 border-b backdrop-blur ${compact ? "bg-white/90 border-slate-200/90 shadow-sm" : "bg-white/70 border-slate-200/70"}`}
      >
        <div className={`container flex items-center justify-between transition-all ${compact ? "py-2" : "py-3"}`}>
          <Link to="/" className="shrink-0" aria-label="الصفحة الرئيسية">
            <Logo />
          </Link>
          <nav className="text-sm text-slate-700 flex items-center gap-5">
            <NavItem to="/search">البحث</NavItem>
            {(role === "technicien" || role === "client") && (
              <NavItem to="/requests">طلباتي</NavItem>
            )}
            {role === "technicien" && (
              <NavItem to="/dashboard">لوحة الحرفي</NavItem>
            )}
            {role === "admin" && (
              <NavItem to="/admin">الإدارة</NavItem>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <NavItem to="/login" noUnderline>دخول</NavItem>
                <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}>
                  <Link
                    to="/register"
                    className="text-sm text-white bg-brand px-3 py-1.5 rounded-2xl shadow-sm hover:shadow-md hover:bg-brand-700"
                  >
                    حساب جديد
                  </Link>
                </motion.div>
              </>
            ) : (
              <motion.button
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                onClick={logout}
                className="text-sm text-white bg-slate-700 px-3 py-1.5 rounded-2xl shadow-sm hover:shadow-md hover:bg-slate-800"
              >
                خروج
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>
      <main className="container px-4 py-6" dir="rtl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<HomeSearch />} />
          <Route path="/technicians/:id" element={<TechnicianProfile />} />
          <Route path="/create-request" element={<CreateRequest />} />

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
      </main>
      <footer dir="rtl" className="border-t bg-white">
        <div className="container px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600">
          <Logo className="opacity-90" />
          <nav className="flex items-center gap-5 text-sm">
            <Link className="hover:text-slate-900" to="#">حول المنصة</Link>
            <Link className="hover:text-slate-900" to="#">سياسة الخصوصية</Link>
            <a className="hover:text-slate-900" href="mailto:contact@7irafyconnect.com">اتصل بنا</a>
          </nav>
        </div>
      </footer>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}

function NavItem({ to, children, noUnderline = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative py-1 hover:text-brand ${isActive ? "text-brand" : "text-slate-700"}`
      }
    >
      {({ isActive }) => (
        <span className="relative inline-block">
          {children}
          {!noUnderline && (
            <motion.span
              className="absolute -bottom-1 right-0 h-0.5 rounded-full bg-gradient-to-l from-brand-400 to-brand-600"
              initial={false}
              animate={{ width: isActive ? "100%" : 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.25 }}
              style={{ insetInlineStart: 'auto', insetInlineEnd: 0 }}
              aria-hidden="true"
            />
          )}
        </span>
      )}
    </NavLink>
  );
}
