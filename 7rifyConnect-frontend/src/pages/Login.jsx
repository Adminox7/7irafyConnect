// src/pages/Login.jsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import { useAuthStore } from "../stores/auth";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginStore = useAuthStore((s) => s.login);
  const nav = useNavigate();
  const location = useLocation();

  const m = useMutation({
    mutationFn: (body) => Api.login(body),
    onSuccess: (res) => {
      // { token, user: { id, email, role, ... } }
      const user = res.user;
      const token = res.token;
      loginStore({ user, token });

      const role = user?.role;
      if (role === "admin") nav("/admin", { replace: true });
      else if (role === "technicien") nav("/dashboard", { replace: true });
      else nav(location.state?.from?.pathname || "/", { replace: true });
    },
  });

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    m.mutate({ email, password });
  };

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4">
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold mb-4 text-slate-900">تسجيل الدخول</h1>
          <form onSubmit={submit} className="space-y-3" dir="rtl">
            <input
              className="border border-slate-300 rounded-2xl px-3 py-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-brand-300/50"
              placeholder="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="border border-slate-300 rounded-2xl px-3 py-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-brand-300/50"
              placeholder="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={m.isPending}
              className="w-full bg-brand-600 text-white rounded-2xl py-2 hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {m.isPending ? "جارٍ الدخول…" : "دخول"}
            </button>
            {m.isError && (
              <div className="text-red-600 text-sm">بيانات الدخول غير صحيحة</div>
            )}
          </form>
          <div className="mt-3 text-sm text-slate-600 text-right">
            ما عندكش حساب؟{" "}
            <Link to="/register" className="text-brand-700 hover:text-brand-800 underline">
              حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
