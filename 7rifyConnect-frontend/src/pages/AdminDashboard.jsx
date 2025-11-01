import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import DashboardCard from "../components/DashboardCard";

const qOpts = {
  retry: 0,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchInterval: false,
  staleTime: 60_000,
};

function ErrorBox({ title = "خطأ", err }) {
  if (!err) return null;
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
      <div className="font-medium mb-1">{title}</div>
      <div>status: <b>{err.status ?? "?"}</b></div>
      <div>message: {String(err.message || "—")}</div>
      {err.data && (
        <pre className="mt-1 overflow-auto max-h-40 text-xs bg-white/70 p-2 rounded">
          {JSON.stringify(err.data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const qc = useQueryClient();

  // من أنا؟
  const {
    data: me,
    isError: meErr,
    error: meError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => Api.me(),
    ...qOpts,
  });

  const notAuthed = meErr || !me;
  const notAdmin = me && me.role !== "admin";

  const {
    data: metrics,
    isLoading: mLoading,
    isError: mError,
    error: mErrObj,
  } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => Api.getAdminMetrics(),
    enabled: !notAuthed && !notAdmin,
    ...qOpts,
  });

  const {
    data: stats,
    isError: sError,
    error: sErrObj,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => Api.getAdminStats(),
    enabled: !notAuthed && !notAdmin,
    ...qOpts,
  });

  const {
    data: pending = [],
    isLoading: tLoading,
    isError: tError,
    error: tErrObj,
  } = useQuery({
    queryKey: ["admin-technicians", "pending"], // ✅ هاد اللي لازم نعمل له invalidate لاحقاً
    queryFn: () => Api.getAdminTechnicians({ status: "pending" }),
    enabled: !notAuthed && !notAdmin,
    ...qOpts,
  });

  const approve = useMutation({
    mutationFn: (id) => Api.approveArtisan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-metrics"] });
      qc.invalidateQueries({ queryKey: ["admin-technicians", "pending"] }); // ✅ إصلاح
    },
  });

  const {
    data: adminRequests = [],
    isLoading: rLoading,
    isError: rError,
    error: rErrObj,
  } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: () => Api.getAdminRequests(),
    enabled: !notAuthed && !notAdmin,
    ...qOpts,
  });

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
        {me && (
          <div className="text-sm text-slate-600">
            المستخدم: <span className="font-medium">{me.email}</span> • الدور:{" "}
            <span className="font-medium">{me.role}</span>
          </div>
        )}
      </div>

      {notAuthed && (
        <>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            لا يمكن تحميل لوحة الإدارة: غير مُسجّل الدخول أو التوكن غير صالح. سجّل بحساب admin.
          </div>
          <ErrorBox title="تفاصيل me()" err={meError} />
        </>
      )}

      {!notAuthed && notAdmin && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          حسابك ليس Admin (الدور الحالي: <b>{me.role}</b>). لا تملك صلاحية الوصول.
        </div>
      )}

      {!notAuthed && !notAdmin && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {mLoading && <div className="col-span-full text-slate-500">جارٍ التحميل…</div>}
            {mError && <ErrorBox title="تعذر تحميل المؤشرات" err={mErrObj} />}
            {metrics && !mError && (
              <>
                <DashboardCard title="المستخدمون" value={metrics.users ?? 0} />
                <DashboardCard title="الحرفيون" value={metrics.technicians ?? 0} />
                <DashboardCard title="بانتظار التحقق" value={metrics.pendingTechnicians ?? 0} />
                <DashboardCard title="عدد الطلبات" value={metrics.totalRequests ?? 0} />
                <DashboardCard title="المداخيل" value={(metrics.revenue ?? 0).toFixed ? metrics.revenue.toFixed(0) : (metrics.revenue ?? 0)} />
              </>
            )}
            {stats && !sError && (
              <>
                <DashboardCard title="الطلبات الجديدة هذا الأسبوع" value={stats.newRequestsWeek ?? 0} />
                <DashboardCard title="متوسط التقييم" value={stats.avgRating ?? 0} />
              </>
            )}
            {sError && <ErrorBox title="تعذر تحميل الإحصائيات" err={sErrObj} />}
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm text-slate-600">حرفيون بانتظار التحقق</div>
            {tLoading && <div className="text-slate-500">جارٍ التحميل…</div>}
            {tError && <ErrorBox title="تعذر تحميل القائمة" err={tErrObj} />}
            <table className="min-w-full text-sm">
              <thead className="text-right text-slate-500">
                <tr>
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">الإسم</th>
                  <th className="py-2 pr-4">البريد</th>
                  <th className="py-2 pr-4">المدينة</th>
                  <th className="py-2 pr-4">الفعل</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(pending) ? pending : []).map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-2 pr-4">{t.id}</td>
                    <td className="py-2 pr-4">{t.name}</td>
                    <td className="py-2 pr-4">{t.email}</td>
                    <td className="py-2 pr-4">{t.city}</td>
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => approve.mutate(t.id)}
                        disabled={approve.isPending}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {approve.isPending ? "جارٍ القبول…" : "قبول"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!tLoading && (Array.isArray(pending) ? pending.length === 0 : true) && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">
                      لا يوجد طلبات تحقق معلّقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-slate-600">الطلبات</div>
            </div>
            {rLoading && <div className="text-slate-500">جارٍ التحميل…</div>}
            {rError && <ErrorBox title="تعذر تحميل الطلبات" err={rErrObj} />}
            <table className="min-w-full text-sm">
              <thead className="text-right text-slate-500">
                <tr>
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">الزبون</th>
                  <th className="py-2 pr-4">الحرفي</th>
                  <th className="py-2 pr-4">الحالة</th>
                  <th className="py-2 pr-4">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(adminRequests) ? adminRequests : []).map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-4">{r.id}</td>
                    <td className="py-2 pr-4">{r.client || "-"}</td>
                    <td className="py-2 pr-4">{r.technician || "-"}</td>
                    <td className="py-2 pr-4">{r.status}</td>
                    <td className="py-2 pr-4">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {!rLoading && (Array.isArray(adminRequests) ? adminRequests.length === 0 : true) && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">لا توجد طلبات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
