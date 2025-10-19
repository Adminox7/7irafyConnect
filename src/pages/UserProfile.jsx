import { useState } from "react";
import { useAuthStore } from "../stores/auth";
import Tabs from "../components/Tabs";
import AvatarUpload from "../components/AvatarUpload";
import toast from "react-hot-toast";

export default function UserProfile() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.name || "");
  const [city, setCity] = useState(user?.city || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatarUrl || "");

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-900">ملفي</h1>
      <Tabs
        tabs={[
          {
            key: "info",
            label: "معلوماتي",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
                <div className="mb-2">
                  <AvatarUpload value={avatar} onChange={setAvatar} placeholder={(name || "ص").slice(0,1)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-sm">
                    <div className="text-slate-600 mb-1">الإسم</div>
                    <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-2xl border border-slate-300 p-2" />
                  </label>
                  <label className="text-sm">
                    <div className="text-slate-600 mb-1">المدينة</div>
                    <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full rounded-2xl border border-slate-300 p-2" />
                  </label>
                  <label className="text-sm">
                    <div className="text-slate-600 mb-1">الهاتف</div>
                    <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full rounded-2xl border border-slate-300 p-2" />
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => toast.success("تم حفظ التغييرات (محلياً)")}
                    className="px-4 py-2 rounded-2xl bg-brand-600 text-white hover:bg-brand-700"
                  >
                    حفظ
                  </button>
                </div>
                <div className="text-xs text-slate-500">تنبيه: هذه مجرد واجهة. لن يتم حفظ التغييرات فعلياً في الموك.</div>
              </div>
            ),
          },
          {
            key: "requests",
            label: "طلباتي",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <a href="/requests" className="text-brand-700 hover:text-brand-800 underline">فتح صفحة طلباتي</a>
              </div>
            ),
          },
          {
            key: "chats",
            label: "دردشاتي",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <a href="/chat" className="text-brand-700 hover:text-brand-800 underline">افتح الدردشة</a>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
