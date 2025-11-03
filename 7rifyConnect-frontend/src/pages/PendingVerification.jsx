export default function PendingVerification() {
  return (
    <div className="page-shell container mx-auto max-w-md px-4 py-16 text-center" dir="rtl">
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-amber-900 mb-2">حسابك قيد المراجعة</h1>
        <p className="text-sm text-amber-800 leading-6">
          شكراً لانضمامك إلى 7irafyConnect. فريقنا الإداري يراجع معلوماتك للتأكد من جاهزية حسابك.
          سنراسلك فور قبول طلبك. يمكنك متابعة بريدك وإشعاراتك داخل المنصة.
        </p>
      </div>
    </div>
  );
}
