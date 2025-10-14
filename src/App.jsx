import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
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

  return (
    <BrowserRouter>
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60" dir="rtl">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" aria-label="الرئيسية" className="flex items-center gap-2">
            <Logo className="!gap-2" />
          </Link>
          <nav className="text-sm text-slate-700 flex items-center gap-5">
            <Link to="/search" className="hover:text-brand-600">البحث</Link>
            {(role === "technicien" || role === "client") && (
              <Link to="/requests" className="hover:text-brand-600">طلباتي</Link>
            )}
            {role === "technicien" && (
              <Link to="/dashboard" className="hover:text-brand-600">لوحة الحرفي</Link>
            )}
            {role === "admin" && (
              <Link to="/admin" className="hover:text-brand-600">الإدارة</Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <Link to="/login" className="text-sm hover:text-brand-600">دخول</Link>
                <Link to="/register" className="text-sm text-white bg-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-700">حساب جديد</Link>
              </>
            ) : (
              <button onClick={logout} className="text-sm text-white bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800">خروج</button>
            )}
          </div>
        </div>
      </header>
      <main className="container max-w-7xl mx-auto px-4 py-8" dir="rtl">
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
      <footer className="mt-10 border-t border-slate-200/70 bg-gradient-to-b from-slate-50/80 to-white/80" dir="rtl">
        <div className="container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
          <div>
            <Logo withText className="mb-2" />
            <p className="text-sm text-slate-600 leading-relaxed">
              منصة تربطك بأفضل الحرفيين القريبين منك بسرعة وثقة.
            </p>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-2">روابط</div>
            <nav className="flex flex-col gap-1 text-sm text-slate-700">
              <Link to="/search" className="hover:text-brand-600">البحث</Link>
              <Link to="/register" className="hover:text-brand-600">حساب جديد</Link>
              <Link to="/login" className="hover:text-brand-600">تسجيل الدخول</Link>
            </nav>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-2">تواصل</div>
            <div className="text-sm text-slate-700">contact@7irafyconnect.com</div>
          </div>
        </div>
        <div className="border-t border-slate-200/70">
          <div className="container max-w-7xl mx-auto px-4 py-4 text-xs text-slate-500 text-center">
            © {new Date().getFullYear()} 7irafyConnect. كل الحقوق محفوظة.
          </div>
        </div>
      </footer>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
