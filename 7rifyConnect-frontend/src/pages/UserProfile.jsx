import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../stores/auth";
import Tabs from "../components/Tabs";
import AvatarUpload from "../components/AvatarUpload";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function UserProfile() {
  // ✅ ما نستعملوش selector كيصنع object جديد
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // ⏳ ما نرندروش قبل ما يكمل rehydrate
  if (!hydrated) {
    return (
      <div className="page-shell container max-w-7xl mx-auto px-4" dir="rtl">
        <div className="h-28 rounded-2xl border border-slate-200 bg-white animate-pulse mt-6" />
      </div>
    );
  }

  // 🔒 غير مسجّل
  if (!user) {
    return (
      <div className="page-shell container max-w-7xl mx-auto px-4" dir="rtl">
        <div className="rounded-2xl border bg-white p-6 mt-6 text-slate-700">
          خاصك تسجّل الدخول باش تشوف الملف.
          <div className="mt-3">
            <Link className="text-brand-700 underline" to="/login">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    );
  }

  // توحيد الحقول
  const initFullName = user.fullName ?? user.full_name ?? "";
  const initCity = user.city ?? "";
  const initPhone = user.phone ?? "";
  const initAvatar = user.avatarUrl ?? user.avatar_url ?? "";

  const [fullName, setFullName] = useState(initFullName);
  const [city, setCity] = useState(initCity);
  const [phone, setPhone] = useState(initPhone);
  const [avatar, setAvatar] = useState(initAvatar);

  // مزامنة إذا تغيّر user من الستور
  useEffect(() => {
    setFullName(user.fullName ?? user.full_name ?? "");
    setCity(user.city ?? "");
    setPhone(user.phone ?? "");
    setAvatar(user.avatarUrl ?? user.avatar_url ?? "");
  }, [user]);

  const saveLocal = () => {
    setUser({
      ...user,
      fullName,
      city,
      phone,
      avatarUrl: avatar,
    });
    toast.success("تم حفظ التغييرات محلياً");
  };

  // ✅ tabs ثابتة بالمرجع (باش ما تشعلش loop داخل <Tabs/>)
  const tabs = useMemo(
    () => [
      {
        key: "info",
        label: "معلوماتي",
        content: (
          <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
            <div className="mb-2">
              <AvatarUpload
                value={avatar}
                onChange={setAvatar}
                placeholder={(fullName || "ص").slice(0, 1)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-slate-600 mb-1">الإسم الكامل</div>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-2"
                />
              </label>

              <label className="text-sm">
                <div className="text-slate-600 mb-1">المدينة</div>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-2"
                />
              </label>

              <label className="text-sm">
                <div className="text-slate-600 mb-1">الهاتف</div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-2"
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveLocal}
                className="px-4 py-2 rounded-2xl bg-brand-600 text-white hover:bg-brand-700"
              >
                حفظ
              </button>
            </div>

            <div className="text-xs text-slate-500">
              تنبيه: لا يوجد حفظ على الخادم حالياً؛ التعديلات محلية فقط.
            </div>
          </div>
        ),
      },
      {
        key: "requests",
        label: "طلباتي",
        content: (
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <Link to="/requests" className="text-brand-700 hover:text-brand-800 underline">
              فتح صفحة طلباتي
            </Link>
          </div>
        ),
      },
      {
        key: "chats",
        label: "دردشاتي",
        content: (
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <Link to="/chat" className="text-brand-700 hover:text-brand-800 underline">
              افتح الدردشة
            </Link>
          </div>
        ),
      },
    ],
    [avatar, fullName, city, phone, user] // deps المعقولة
  );

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-900">ملفي</h1>
      <Tabs tabs={tabs} />
    </div>
  );
}
