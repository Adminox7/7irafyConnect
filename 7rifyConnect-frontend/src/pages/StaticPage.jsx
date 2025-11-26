export default function StaticPage({ title, children }) {
  return (
    <div className="page-shell mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10" dir="rtl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <div className="prose prose-rtl max-w-none text-slate-700">{children}</div>
      </div>
    </div>
  );
}
