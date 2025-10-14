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
      loginStore({ user: res.user, token: res.token, role: res.role });
      const role = res.role;
      if (role === "admin") nav("/admin");
      else if (role === "technicien") nav("/dashboard");
      else nav(location.state?.from?.pathname || "/");
    },
  });

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    m.mutate({ email, password });
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">تسجيل الدخول</h1>
        <form onSubmit={submit} className="space-y-3" dir="rtl">
          <input
            className="border rounded-lg px-3 py-2 w-full text-right"
            placeholder="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border rounded-lg px-3 py-2 w-full text-right"
            placeholder="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={m.isPending}
            className="w-full bg-brand text-white rounded-lg py-2 hover:bg-brand-700 disabled:opacity-60"
          >
            {m.isPending ? "جارٍ الدخول…" : "دخول"}
          </button>
          {m.isError && (
            <div className="text-red-600 text-sm">بيانات الدخول غير صحيحة</div>
          )}
        </form>
        <div className="mt-3 text-sm text-slate-600 text-right">
          ما عندكش حساب؟ <Link to="/register" className="text-brand underline">حساب جديد</Link>
        </div>
      </div>
    </div>
  );
}
