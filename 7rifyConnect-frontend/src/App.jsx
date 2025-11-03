// src/App.jsx
import { useEffect } from "react";
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
import NotificationBell from "./components/NotificationBell";
import { useNotificationStore } from "./stores/notifications";
import { getEcho, initEcho, teardownEcho } from "./lib/echo";
import toast from "react-hot-toast";
import PendingVerification from "./pages/PendingVerification";
import { useQueryClient } from "@tanstack/react-query";

export default function App() {
  // استخدم selectors منفصلة (أكثر استقراراً)
  const user   = useAuthStore((s) => s.user);
  const token  = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const role   = user?.role;
  const totalUnread = useNotificationStore((s) => s.totalUnread);
  const incrementThread = useNotificationStore((s) => s.incrementThread);
  const incrementAdminPending = useNotificationStore((s) => s.incrementAdminPending);
  const pushInbox = useNotificationStore((s) => s.pushInbox);
  const resetNotifications = useNotificationStore((s) => s.reset);
  const qc = useQueryClient();

  useEffect(() => {
    if (!token) {
      teardownEcho();
      resetNotifications();
      return undefined;
    }
    initEcho(token);
    return () => {
      teardownEcho();
    };
  }, [token, resetNotifications]);

  useEffect(() => {
    const echo = getEcho();
    if (!echo || !user?.id) return undefined;

    const channel = echo.private(`users.${user.id}`);

    channel.notification((notification) => {
      const payload = notification?.data || notification;
      const type = payload?.type;

        if (type === "message") {
          const threadId = payload?.thread_id;
          if (threadId) {
            incrementThread(threadId);
            qc.setQueryData(["threads", user?.id], (prev = []) => {
              const arr = Array.isArray(prev) ? [...prev] : [];
              const idx = arr.findIndex((t) => Number(t?.id) === Number(threadId));
              const text = payload?.body || payload?.message || "رسالة جديدة";
              const fromSameUser = Number(payload?.from_user_id ?? payload?.sender_id) === user?.id;
              if (idx !== -1) {
                const current = arr[idx] || {};
                arr[idx] = {
                  ...current,
                  lastMessage: text,
                  unreadCount: (current.unreadCount || 0) + (fromSameUser ? 0 : 1),
                  updatedAt: payload?.created_at || new Date().toISOString(),
                };
              } else {
                arr.unshift({
                  id: threadId,
                  lastMessage: text,
                  unreadCount: fromSameUser ? 0 : 1,
                  peer: payload?.sender ?? null,
                  updatedAt: payload?.created_at || new Date().toISOString(),
                });
              }
              return arr;
            });
          }
        pushInbox({
          id: notification.id,
          title: "رسالة جديدة",
          body: payload?.body || "وصلتك رسالة جديدة.",
          createdAt: payload?.created_at || new Date().toISOString(),
        });
        toast.success("وصلتك رسالة جديدة");
      } else if (type === "technician_pending") {
        incrementAdminPending();
        pushInbox({
          id: notification.id,
          title: "حرفي بانتظار التحقق",
          body: payload?.user?.name ? `الحرفي ${payload.user.name} ينتظر موافقتك` : "حرفي جديد ينتظر التحقق",
          createdAt: payload?.created_at || new Date().toISOString(),
        });
      } else if (type === "technician_approved") {
        pushInbox({
          id: notification.id,
          title: "تمت الموافقة على حسابك",
          body: "يمكنك الآن الوصول للوحة الحرفي.",
          createdAt: payload?.created_at || new Date().toISOString(),
        });
        toast.success("تمت الموافقة على حسابك كحرفي");
      }
    });

    return () => {
      channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
      channel.unsubscribe();
    };
  }, [user?.id, incrementThread, incrementAdminPending, pushInbox]);

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
                      `relative text-sm px-3 py-1.5 rounded-2xl border ${
                        isActive
                          ? "border-brand-300 text-brand-700"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    دردشة
                    {totalUnread > 0 && (
                      <span className="absolute -top-1 -left-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                        {totalUnread}
                      </span>
                    )}
                  </NavLink>
                  <button
                    onClick={logout}
                    className="text-sm text-white bg-slate-700 px-3 py-1.5 rounded-2xl hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 shadow-sm"
                  >
                    خروج
                  </button>
                  <NotificationBell />
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
                path="/pending-verification"
                element={
                  <ProtectedRoute role="technicien" allowPending>
                    <PendingVerification />
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
