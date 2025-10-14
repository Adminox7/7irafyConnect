import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import { useAuthStore } from "../stores/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [role, setRole] = useState("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const loginStore = useAuthStore((s) => s.login);
  const nav = useNavigate();

  const m = useMutation({
    mutationFn: (body) => Api.register(body),
    onSuccess: (res) => {
      loginStore({ user: res.user, token: res.token, role: res.role });
      if (res.role === "technicien" && res.user?.verified === false) {
        alert("يتطلب التحقق من طرف الإدارة قبل استخدام لوحة الحرفي.");
      }
      nav("/");
    },
  });

  const submit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    m.mutate({ role, name, email, password, city, phone });
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" dir="rtl">
        <h1 className="text-xl font-semibold mb-4 text-slate-900">حساب جديد</h1>
        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-3">
            <label className={`px-3 py-2 rounded-2xl border cursor-pointer transition-colors ${role === "client" ? "bg-black text-white border-brand-600" : "hover:bg-slate-50"}`}>
              <input type="radio" name="role" value="client" className="hidden" checked={role === "client"} onChange={() => setRole("client")} />
              زبون
            </label>
            <label className={`px-3 py-2 rounded-2xl border cursor-pointer transition-colors ${role === "technicien" ? "bg-black text-white border-brand-600" : "hover:bg-slate-50"}`}>
              <input type="radio" name="role" value="technicien" className="hidden" checked={role === "technicien"} onChange={() => setRole("technicien")} />
              حرفي
            </label>
          </div>
          <input className="border border-slate-300 rounded-2xl px-3 py-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-brand-300/50" placeholder="الإسم الكامل" value={name} onChange={(e)=>setName(e.target.value)} />
          <input className="border border-slate-300 rounded-2xl px-3 py-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-brand-300/50" placeholder="البريد الإلكتروني" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="border border-slate-300 rounded-2xl px-3 py-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-brand-300/50" placeholder="كلمة المرور" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <input className="border border-slate-300 rounded-2xl px-3 py-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-brand-300/50" placeholder="المدينة" value={city} onChange={(e)=>setCity(e.target.value)} />
          <input className="border border-slate-300 rounded-2xl px-3 py-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-brand-300/50" placeholder="الهاتف" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          <button type="submit" disabled={m.isPending} className="w-full bg-brand-600 text-white rounded-2xl py-2 hover:bg-brand-700 disabled:opacity-60 transition-colors">
            {m.isPending ? "جارٍ التسجيل…" : "إنشاء الحساب"}
          </button>
          {m.isError && (
            <div className="text-red-600 text-sm">تعذر إنشاء الحساب. تأكد من الحقول.</div>
          )}
        </form>
        <div className="mt-3 text-sm text-slate-600 text-right">
          عندك حساب؟ <Link to="/login" className="text-brand-700 hover:text-brand-800 underline">دخول</Link>
        </div>
      </div>
    </div>
  );
}
