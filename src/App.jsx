import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
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
      <header className="border-b bg-white" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-brand">7irafyConnect</Link>
          <nav className="text-sm text-slate-700 flex items-center gap-5">
            <Link to="/search" className="hover:text-brand">البحث</Link>
            {(role === "technicien" || role === "client") && (
              <Link to="/requests" className="hover:text-brand">طلباتي</Link>
            )}
            {role === "technicien" && (
              <Link to="/dashboard" className="hover:text-brand">لوحة الحرفي</Link>
            )}
            {role === "admin" && (
              <Link to="/admin" className="hover:text-brand">الإدارة</Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <Link to="/login" className="text-sm hover:text-brand">دخول</Link>
                <Link to="/register" className="text-sm text-white bg-brand px-3 py-1.5 rounded-lg hover:bg-brand-700">حساب جديد</Link>
              </>
            ) : (
              <button onClick={logout} className="text-sm text-white bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800">خروج</button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6" dir="rtl">
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
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
