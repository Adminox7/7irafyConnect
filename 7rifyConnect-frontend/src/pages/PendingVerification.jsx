import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../stores/auth";
import { getUserVerificationFlag, isTechnicianUser } from "../lib/auth";

export default function PendingVerification() {
  const user = useAuthStore((s) => s.user);
  const nav = useNavigate();
  const isTech = isTechnicianUser(user);
  const verified = getUserVerificationFlag(user);

  useEffect(() => {
    if (isTech && verified) {
      nav("/dashboard", { replace: true });
    }
  }, [isTech, verified, nav]);

  return (
    <div className="page-shell container max-w-2xl mx-auto px-4 py-12" dir="rtl">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-right">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">في انتظار التحقق</h1>
        <p className="text-slate-600 leading-relaxed">
          شكراً لانضمامك إلى 7irafyConnect. حسابك كحرفي قيد المراجعة حالياً.
          سنتواصل معك فور قبول الطلب عبر البريد والإشعارات داخل التطبيق.
        </p>
        <div className="mt-6 space-x-0 space-y-0 md:space-x-3 md:space-y-0 flex flex-col md:flex-row md:justify-start md:items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            الصفحة الرئيسية
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center justify-center rounded-2xl bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
          >
            استكشف الحرفيين
          </Link>
        </div>
      </div>
    </div>
  );
}

