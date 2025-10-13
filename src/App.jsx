import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomeSearch from "./pages/HomeSearch";
import TechnicianProfile from "./pages/TechnicianProfile";
import CreateRequest from "./pages/CreateRequest";
import MyRequests from "./pages/MyRequests";
import { Toaster } from "react-hot-toast";

export default function App(){
  return (
    <BrowserRouter>
      <header className="p-4 border-b bg-white">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          <Link to="/" className="text-xl font-semibold text-cyan-700">7irafyConnect</Link>
          <nav className="text-sm text-slate-600 flex gap-4">
            <Link to="/">البحث</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<HomeSearch/>} />
          <Route path="/technicians/:id" element={<TechnicianProfile/>} />
          <Route path="/create-request" element={<CreateRequest/>} />
          <Route path="/requests" element={<MyRequests/>} />
        </Routes>
      </main>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
