import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Api } from "../api/endpoints";
import DashboardCard from "../components/DashboardCard";
import { useNoticeStore } from "../stores/notifications";

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
  const setPendingCount = useNoticeStore((s) => s.setPendingTechnicians);

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
    queryKey: ["admin-technicians", "pending"],
    queryFn: () => Api.getPendingTechnicians(),
    enabled: !notAuthed && !notAdmin,
    ...qOpts,
  });

  const approve = useMutation({
    mutationFn: (id) => Api.approveTechnician(id),
    onSuccess: () => {
      toast.success("تم القبول");
      qc.invalidateQueries({ queryKey: ["admin-metrics"] });
      qc.invalidateQueries({ queryKey: ["admin-technicians", "pending"] });
    },
    onError: () => toast.error("تعذر القبول"),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => Api.rejectTechnician(id, reason ? { reason } : undefined),
    onSuccess: () => {
      toast.success("تم الرفض");
      qc.invalidateQueries({ queryKey: ["admin-technicians", "pending"] });
      qc.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
    onError: () => toast.error("تعذر الرفض"),
  });

  useEffect(() => {
    if (!Array.isArray(pending)) {
      setPendingCount(0);
      return;
    }
    setPendingCount(pending.length);
  }, [pending, setPendingCount]);

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
                  <th className="py-2 pr-4">الإسم / البريد الإلكتروني</th>
                  <th className="py-2 pr-4">المدينة / الهاتف</th>
                  <th className="py-2 pr-4">التخصصات والوصف</th>
                  <th className="py-2 pr-4">الوثائق</th>
                  <th className="py-2 pr-4">الفعل</th>
                </tr>
              </thead>
              <tbody>
                  {(Array.isArray(pending) ? pending : []).map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="py-2 pr-4">{t.id}</td>
                      <td className="py-2 pr-4">
                        <div className="font-medium text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-500 break-words">{t.email}</div>
                      </td>
                      <td className="py-2 pr-4">
                        <div>{t.city || "-"}</div>
                        <div className="text-xs text-slate-500">{t.phone || "-"}</div>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {(t.specialties || []).map((s) => (
                            <span key={s} className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 text-xs">
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 max-w-xs break-words">
                          {t.specialtyDescription || t.bio || "-"}
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {t.avatarUrl ? (
                            <a className="text-brand-700 underline" href={t.avatarUrl} target="_blank" rel="noreferrer">
                              صورة الملف الشخصي
                            </a>
                          ) : null}
                          {t.nationalIdFrontUrl ? (
                            <a className="text-brand-700 underline" href={t.nationalIdFrontUrl} target="_blank" rel="noreferrer">
                              بطاقة وطنية (أمامي)
                            </a>
                          ) : null}
                          {t.nationalIdBackUrl ? (
                            <a className="text-brand-700 underline" href={t.nationalIdBackUrl} target="_blank" rel="noreferrer">
                              بطاقة وطنية (خلفي)
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-2 pr-4 flex items-center gap-2">
                        <button
                          onClick={() => approve.mutate(t.id)}
                          disabled={approve.isPending}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {approve.isPending ? "جارٍ القبول…" : "قبول"}
                        </button>
                        <button
                          onClick={() => {
                            const reason =
                              typeof window !== "undefined"
                                ? window.prompt("سبب الرفض (اختياري)")
                                : undefined;
                            if (reason === null) return;
                            reject.mutate({ id: t.id, reason });
                          }}
                          disabled={reject.isPending || approve.isPending}
                          className="px-3 py-1.5 rounded-lg border border-danger-300 text-danger-700 hover:bg-danger-50 disabled:opacity-60"
                        >
                          {reject.isPending ? "جارٍ الرفض…" : "رفض"}
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
