import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import { useAuthStore } from "../stores/auth";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../components/Input";
import Button from "../components/Button";
import TagInput from "../components/TagInput";

export default function Register() {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "technicien" ? "technicien" : "client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  // Technician-only fields
  const [specialties, setSpecialties] = useState([]);
  const [bio, setBio] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const loginStore = useAuthStore((s) => s.login);
  const nav = useNavigate();

    const m = useMutation({
      mutationFn: (body) => Api.register(body),
      onSuccess: (res) => {
        loginStore({ user: res.user, token: res.token, role: res.role });
        const isTech = res.role === "technicien";
        const isVerified =
          res.user?.technician?.isVerified ?? res.user?.technician?.is_verified ?? false;
        toast.success(
          isTech && !isVerified
            ? "تم التسجيل، حسابك في انتظار التحقق"
            : "تم إنشاء الحساب بنجاح"
        );
        if (isTech) {
          nav(isVerified ? "/dashboard" : "/pending-verification");
        } else {
          nav("/search");
        }
      },
      onError: (err) => {
        toast.error(err?.message || "تعذر إنشاء الحساب");
      },
    });

  const submit = (e) => {
    e.preventDefault();
    // Basic validations
    const emailOk = /.+@.+\..+/.test(email);
    const passOk = String(password).length >= 6;
    const phoneOk = /^\d{6,}$/.test(String(phone || "").replace(/\D/g, ""));
    const cityOk = Boolean(city && city.trim().length >= 2);
    if (!name) return toast.error("الإسم مطلوب");
    if (!emailOk) return toast.error("بريد غير صالح");
    if (!passOk) return toast.error("كلمة المرور على الأقل 6 أحرف");
    if (!cityOk) return toast.error("المدينة مطلوبة");
    if (!phoneOk) return toast.error("الهاتف غير صالح");
    if (role === "technicien" && specialties.length < 1) {
      return toast.error("اختَر تخصصاً واحداً على الأقل");
    }
    m.mutate({ role, name, email, password, city, phone, specialties, bio, isPremium });
  };

  return (
    <div className="page-shell mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" dir="rtl">
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

          <Input placeholder="الإسم الكامل" value={name} onChange={(e)=>setName(e.target.value)} />
          <Input placeholder="البريد الإلكتروني" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <Input placeholder="كلمة المرور" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <Input placeholder="المدينة" value={city} onChange={(e)=>setCity(e.target.value)} />
          <Input placeholder="الهاتف" value={phone} onChange={(e)=>setPhone(e.target.value)} />

          {role === "technicien" && (
            <div className="space-y-3">
              <TagInput value={specialties} onChange={setSpecialties} />
              <label className="text-sm">
                <div className="text-slate-600 mb-1">نبذة قصيرة</div>
                <textarea className="w-full rounded-2xl border border-slate-300 p-2" rows={3} placeholder="اكتب نبذة قصيرة عن خبرتك" value={bio} onChange={(e)=>setBio(e.target.value)} />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="rounded" checked={isPremium} onChange={(e)=>setIsPremium(e.target.checked)} />
                حرفي مميّز (Premium)
              </label>
            </div>
          )}

          <Button type="submit" disabled={m.isPending} className="w-full">
            {m.isPending ? "جارٍ التسجيل…" : "إنشاء الحساب"}
          </Button>
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
