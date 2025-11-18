// src/App.jsx
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import PendingVerification from "./pages/PendingVerification";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/auth";
import ErrorBoundary from "./components/ErrorBoundary";
import NotificationBell from "./components/NotificationBell";
import { ensureEchoAuthSync, initializeEcho } from "./lib/echo";
import { initNoticeAuthSubscription } from "./stores/notifications";
import { useChatThreads } from "./hooks/useChatThreads";
import { Api } from "./api/endpoints";
import { getUserVerificationFlag, isTechnicianUser } from "./lib/auth";

export default function App() {
  // استخدم selectors منفصلة (أكثر استقراراً)
  const user     = useAuthStore((s) => s.user);
  const token    = useAuthStore((s) => s.token);
  const logout   = useAuthStore((s) => s.logout);
  const setUser  = useAuthStore((s) => s.setUser);
  const hydrated = useAuthStore((s) => s.hydrated);
  const role   = user?.role;
  const meId   = user?.id;
  const isTech = isTechnicianUser(user);
  const isTechVerified = getUserVerificationFlag(user);

  useEffect(() => {
    initNoticeAuthSubscription();
    ensureEchoAuthSync();
  }, []);

  useEffect(() => {
    if (token) {
      initializeEcho();
    }
  }, [token]);

  useEffect(() => {
    if (!token || !hydrated) return;
    let cancelled = false;
    let pollTimer;

    const refreshProfile = async () => {
      try {
        const res = await Api.me({ suppressToast: true });
        if (cancelled) return;
        const nextUser = res?.user ?? res ?? null;
        if (nextUser) {
          setUser(nextUser);
        }
      } catch (err) {
        if (err?.status === 401) {
          logout();
        }
      }
    };

    refreshProfile();

    if (isTech && !isTechVerified) {
      pollTimer = setInterval(refreshProfile, 10000);
    }

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [token, hydrated, isTech, isTechVerified, setUser, logout]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  useChatThreads(meId);

  const navLinkClasses = (isActive, isMobile = false) => {
    if (isMobile) {
      return `block rounded-xl px-3 py-2 font-medium transition-colors ${
        isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
      }`;
    }

    return `group relative pb-1 transition-colors ${
      isActive ? "text-brand-700" : "hover:text-brand-700"
    } after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-right rtl:after:origin-left after:scale-x-0 ${
      isActive ? "after:scale-x-100" : "group-hover:after:scale-x-100"
    } after:rounded-full after:bg-brand-500 motion-safe:after:transition-transform`;
  };

  const renderNavLinks = (isMobile = false) => (
    <>
      <NavLink
        to="/search"
        className={({ isActive }) => navLinkClasses(isActive, isMobile)}
        onClick={isMobile ? closeMobileMenu : undefined}
      >
        ??????
      </NavLink>

      {token && (
        <NavLink
          to="/requests"
          className={({ isActive }) => navLinkClasses(isActive, isMobile)}
          onClick={isMobile ? closeMobileMenu : undefined}
        >
          ??????
        </NavLink>
      )}

      {role === "technicien" && (
        <NavLink
          to="/dashboard"
          className={({ isActive }) => navLinkClasses(isActive, isMobile)}
          onClick={isMobile ? closeMobileMenu : undefined}
        >
          ?????? ??????
        </NavLink>
      )}

      {role === "admin" && (
        <NavLink
          to="/admin"
          className={({ isActive }) => navLinkClasses(isActive, isMobile)}
          onClick={isMobile ? closeMobileMenu : undefined}
        >
          ?????? ???????
        </NavLink>
      )}
    </>
  );


  return (
    <BrowserRouter>
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70"
        dir="rtl"
      >
        <div className="container max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
            <Link to="/" aria-label="????????" className="flex items-center gap-2">
              <Logo className="!gap-2" />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-5 text-sm text-slate-700">
            {renderNavLinks()}
          </nav>

          <div className="hidden md:flex items-center gap-3 text-sm">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl px-2 py-1 text-slate-700 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                >
                  ????
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-brand-600 px-3 py-1.5 text-white shadow-sm hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                >
                  ???? ????
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <NavLink
                  to={role === "technicien" ? "/me/tech" : "/me"}
                  className={({ isActive }) =>
                    `rounded-2xl border px-3 py-1.5 ${
                      isActive
                        ? "border-brand-300 text-brand-700"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  ????
                </NavLink>
                <NavLink
                  to="/chat"
                  className={({ isActive }) =>
                    `rounded-2xl border px-3 py-1.5 ${
                      isActive
                        ? "border-brand-300 text-brand-700"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  ??????
                </NavLink>
                <button
                  onClick={logout}
                  className="rounded-2xl bg-slate-700 px-3 py-1.5 text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                >
                  ????
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:hidden">
          <div
            className={`fixed inset-0 z-[60] bg-slate-900/40 transition-opacity duration-300 ${
              mobileMenuOpen ? "opacity-100 pointer-events-auto" : "pointer-events-none opacity-0"
            }`}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <aside
            className={`fixed inset-y-0 right-0 z-[70] w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            dir="rtl"
            aria-hidden={!mobileMenuOpen}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="text-base font-semibold text-slate-800">?????</span>
              <button
                type="button"
                className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                onClick={closeMobileMenu}
                aria-label="إغلاق القائمة"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4 px-4 py-4 text-sm text-slate-700">
              <div className="space-y-2">{renderNavLinks(true)}</div>

              <div className="space-y-3 border-t border-slate-200 pt-4">
                {!token ? (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block rounded-xl border border-slate-200 px-3 py-2 text-center font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700"
                    >
                      ????
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="block rounded-xl bg-brand-600 px-3 py-2 text-center font-medium text-white shadow-sm hover:bg-brand-700"
                    >
                      ???? ????
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                      <span className="font-medium text-slate-700">????????</span>
                      <NotificationBell />
                    </div>
                    <NavLink
                      to={role === "technicien" ? "/me/tech" : "/me"}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `block rounded-xl border px-3 py-2 text-center font-medium ${
                          isActive
                            ? "border-brand-300 text-brand-700"
                            : "border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-700"
                        }`
                      }
                    >
                      ????
                    </NavLink>
                    <NavLink
                      to="/chat"
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `block rounded-xl border px-3 py-2 text-center font-medium ${
                          isActive
                            ? "border-brand-300 text-brand-700"
                            : "border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-700"
                        }`
                      }
                    >
                      ??????
                    </NavLink>
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        logout();
                      }}
                      className="block rounded-xl bg-slate-700 px-3 py-2 text-center font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                    >
                      ????
                    </button>
                  </>
                )}
              </div>
            </div>
          </aside>
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
            <Route
              path="/chat/:threadId?"
              element={
                <ProtectedRoute>
                  <ChatWindow />
                </ProtectedRoute>
              }
            />
              <Route path="/pending-verification" element={<PendingVerification />} />

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


