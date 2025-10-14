import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomeSearch from "./pages/HomeSearch";
import TechnicianProfile from "./pages/TechnicianProfile";
import CreateRequest from "./pages/CreateRequest";
import MyRequests from "./pages/MyRequests";
import TechDashboard from "./pages/TechDashboard";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <BrowserRouter>
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-brand">7irafyConnect</Link>
          <nav className="text-sm text-slate-700 flex items-center gap-5">
            <Link to="/" className="hover:text-brand">البحث</Link>
            <Link to="/requests" className="hover:text-brand">طلباتي</Link>
            <Link to="/dashboard" className="hover:text-brand">لوحة الحرفي</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomeSearch/>} />
          <Route path="/technicians/:id" element={<TechnicianProfile/>} />
          <Route path="/create-request" element={<CreateRequest/>} />
          <Route path="/requests" element={<MyRequests/>} />
          <Route path="/dashboard" element={<TechDashboard/>} />
        </Routes>
      </main>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
