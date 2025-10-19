import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
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
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/auth";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

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

            {(role === "technicien" || role === "client") && (
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
                  to="/me"
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

      {/* MAIN — بدون padding باش مايبقاش الفراغ الأبيض */}
      <main className="p-0 min-h-[60vh]" dir="rtl">
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<HomeSearch />} />
          <Route path="/technicians/:id" element={<TechnicianProfile />} />
          <Route path="/create-request" element={<CreateRequest />} />
          <Route path="/chat/:threadId?" element={<ChatWindow />} />

          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <UserProfile />
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

      {/* FOOTER — حيدنا mt-10 باش يلصق من التحت */}
      <footer className="border-t border-slate-200 bg-slate-50" dir="rtl">
        <div className="container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-right text-slate-600">
          <div>
            <Logo withText className="mb-2" />
            <p className="text-sm leading-relaxed">
              منصة تربطك بأفضل الحرفيين القريبين منك بسرعة وثقة.
            </p>
          </div>

          <div>
            <div className="font-semibold text-slate-900 mb-2">روابط</div>
            <nav className="flex flex-col gap-1 text-sm">
              <Link
                to="/search"
                className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-md px-1"
              >
                البحث
              </Link>
              <Link
                to="/register"
                className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-md px-1"
              >
                حساب جديد
              </Link>
              <Link
                to="/login"
                className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-md px-1"
              >
                تسجيل الدخول
              </Link>
            </nav>
          </div>

          <div>
            <div className="font-semibold text-slate-900 mb-2">تواصل</div>
            <div className="text-sm">contact@7irafyconnect.com</div>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <div className="container max-w-7xl mx-auto px-4 py-4 text-xs text-slate-500 text-center">
            © {new Date().getFullYear()} 7irafyConnect. كل الحقوق محفوظة.
          </div>
        </div>
      </footer>

      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
