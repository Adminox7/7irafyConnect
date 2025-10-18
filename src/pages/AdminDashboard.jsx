import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import DashboardCard from "../components/DashboardCard";

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { data: metrics, isLoading: mLoading, isError: mError } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => Api.getAdminMetrics(),
  });
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => Api.getAdminStats(),
  });
  const { data: pending = [], isLoading: tLoading, isError: tError } = useQuery({
    queryKey: ["admin-technicians", { status: "pending" }],
    queryFn: () => Api.getAdminTechnicians({ status: "pending" }),
  });

  const verify = useMutation({
    mutationFn: (id) => Api.verifyTechnician(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-metrics"] });
      qc.invalidateQueries({ queryKey: ["admin-technicians"] });
    },
  });

  const { data: adminRequests = [], isLoading: rLoading, isError: rError } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: () => Api.getAdminRequests(),
  });

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">لوحة الإدارة</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {mLoading && <div className="col-span-full text-slate-500">جارٍ التحميل…</div>}
        {mError && <div className="col-span-full text-red-600">تعذر تحميل المؤشرات</div>}
        {metrics && (
          <>
            <DashboardCard title="المستخدمون" value={metrics.users} />
            <DashboardCard title="الحرفيون" value={metrics.technicians} />
            <DashboardCard title="بانتظار التحقق" value={metrics.pendingTechnicians} />
            <DashboardCard title="عدد الطلبات" value={metrics.totalRequests} />
            <DashboardCard title="المداخيل" value={metrics.revenue} />
          </>
        )}
        {stats && (
          <>
            <DashboardCard title="الطلبات الجديدة هذا الأسبوع" value={stats.newRequestsWeek} />
            <DashboardCard title="متوسط التقييم" value={stats.avgRating} />
          </>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm text-slate-600">حرفيون بانتظار التحقق</div>
        {tLoading && <div className="text-slate-500">جارٍ التحميل…</div>}
        {tError && <div className="text-red-600">تعذر تحميل القائمة</div>}
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">الإسم</th>
              <th className="py-2 pr-4">البريد</th>
              <th className="py-2 pr-4">المدينة</th>
              <th className="py-2 pr-4">الفعل</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="py-2 pr-4">{t.id}</td>
                <td className="py-2 pr-4">{t.name}</td>
                <td className="py-2 pr-4">{t.email}</td>
                <td className="py-2 pr-4">{t.city}</td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => verify.mutate(t.id)}
                    disabled={verify.isPending}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {verify.isPending ? "جارٍ القبول…" : "قبول"}
                  </button>
                </td>
              </tr>
            ))}
            {!tLoading && pending.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-500">لا يوجد طلبات تحقق معلقة</td>
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
        {rError && <div className="text-red-600">تعذر تحميل الطلبات</div>}
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">الزبون</th>
              <th className="py-2 pr-4">الحرفي</th>
              <th className="py-2 pr-4">الحالة</th>
              <th className="py-2 pr-4">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {adminRequests.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-4">{r.id}</td>
                <td className="py-2 pr-4">{r.client || "-"}</td>
                <td className="py-2 pr-4">{r.technician || "-"}</td>
                <td className="py-2 pr-4">{r.status}</td>
                <td className="py-2 pr-4">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!rLoading && adminRequests.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-500">لا توجد طلبات</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
