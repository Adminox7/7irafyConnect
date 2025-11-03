import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Api } from "../api/endpoints";
import DashboardCard from "../components/DashboardCard";
import StatusBadge from "../components/StatusBadge";
import { Link, useNavigate } from "react-router-dom";

/* ── تحميل Recharts بشكل lazy وآمن ── */
function useRecharts() {
  const [lib, setLib] = useState(null);
  useEffect(() => {
    let mounted = true;
    import("recharts").then((m) => mounted && setLib(m)).catch(() => {});
    return () => { mounted = false; };
  }, []);
  return lib;
}

/* ── helpers ── */
const normReq = (r) => ({
  id: r.id ?? r.request_id,
  title: r.title ?? "-",
  city: r.city ?? "-",
  status: r.status ?? r.state ?? "new",
  price: r.price ?? r.total ?? null,
  client: r.client_name ?? r.client ?? "-",
  createdAt: r.createdAt ?? r.created_at ?? r.created_on ?? null,
});

const buildWeekly = (rows) => {
  // رجّع آخر 7 أيام بعدّاد الطلبات
  const byDay = {};
  rows.forEach((x) => {
    const d = x.createdAt ? new Date(x.createdAt) : null;
    if (!d) return;
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    byDay[key] = (byDay[key] || 0) + 1;
  });
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { date: key, requests: byDay[key] || 0 };
  });
  return days;
};

export default function TechDashboard() {
  const qc = useQueryClient();
  const recharts = useRecharts();
  const navigate = useNavigate();

  /* ── لائحة كاملة (باش نحسب KPIs/Chart/Recent) ── */
  const allQ = useQuery({
    queryKey: ["tech-requests", "all"],
    queryFn: () => Api.getTechRequests({ status: "all" }),
  });

  useEffect(() => {
    const status = allQ.error?.status;
    const code = allQ.error?.data?.status;
    if (allQ.isError && status === 403 && code === "pending_verification") {
      toast.error("حسابك في انتظار التحقق");
      navigate("/pending-verification", { replace: true });
    }
  }, [allQ.isError, allQ.error, navigate]);

  /* ── فلتر الجدول حسب الحالة ── */
  const [status, setStatus] = useState("all");
  const listQ = useQuery({
    queryKey: ["tech-requests", status],
    queryFn: () => Api.getTechRequests({ status }),
  });

  /* ── أفعال الحالة ── */
  const makeAction = (kind) =>
    useMutation({
      mutationFn: (id) => {
        if (kind === "accept") return Api.acceptRequest(id);
        if (kind === "start") return Api.startRequest(id);
        if (kind === "complete") return Api.completeRequest(id);
        if (kind === "cancel") return Api.cancelRequest(id);
      },
      onMutate: async (id) => {
        await Promise.all([
          qc.cancelQueries({ queryKey: ["tech-requests", status] }),
          qc.cancelQueries({ queryKey: ["tech-requests", "all"] }),
        ]);

        const prevList = qc.getQueryData(["tech-requests", status]);
        const prevAll = qc.getQueryData(["tech-requests", "all"]);

        const nextStatus =
          kind === "accept"
            ? "accepted"
            : kind === "start"
            ? "in_progress"
            : kind === "complete"
            ? "done"
            : "cancelled";

        const patch = (arr) =>
          (Array.isArray(arr) ? arr : []).map((r) =>
            r.id === id ? { ...r, status: nextStatus } : r
          );

        qc.setQueryData(["tech-requests", status], (p) => patch(p));
        qc.setQueryData(["tech-requests", "all"], (p) => patch(p));

        return { prevList, prevAll };
      },
      onError: (_e, _id, ctx) => {
        if (ctx?.prevList) qc.setQueryData(["tech-requests", status], ctx.prevList);
        if (ctx?.prevAll) qc.setQueryData(["tech-requests", "all"], ctx.prevAll);
        toast.error("فشل تنفيذ العملية");
      },
      onSuccess: () => {
        const msg =
          kind === "accept"
            ? "تم القبول"
            : kind === "start"
            ? "تم البدء"
            : kind === "complete"
            ? "تم الإنهاء"
            : "تم الإلغاء";
        toast.success(msg);
        qc.invalidateQueries({ queryKey: ["tech-requests"] });
      },
    });

  const accept = makeAction("accept");
  const start = makeAction("start");
  const complete = makeAction("complete");
  const cancel = makeAction("cancel");

  /* ── اشتقاق البيانات ── */
  const allRows = useMemo(
    () => (Array.isArray(allQ.data) ? allQ.data.map(normReq) : []),
    [allQ.data]
  );

  const kpi = useMemo(() => {
    const cnt = (s) => allRows.filter((r) => r.status === s).length;
    const revenue = allRows
      .filter((r) => r.status === "done" && r.price)
      .reduce((a, b) => a + Number(b.price || 0), 0);
    return {
      newC: cnt("new"),
      accC: cnt("accepted"),
      progC: cnt("in_progress"),
      doneC: cnt("done"),
      revenue,
    };
  }, [allRows]);

  const weekly = useMemo(() => buildWeekly(allRows), [allRows]);

  const recent = useMemo(() => {
    const sorted = [...allRows].sort((a, b) => {
      const A = a.createdAt ? +new Date(a.createdAt) : 0;
      const B = b.createdAt ? +new Date(b.createdAt) : 0;
      return B - A;
    });
    return sorted.slice(0, 6);
  }, [allRows]);

  const listAll = useMemo(
    () => (Array.isArray(listQ.data) ? listQ.data.map(normReq) : []),
    [listQ.data]
  );

  /* ── حالات تحميل/أخطاء ── */
  if (allQ.isLoading) return <div>جارٍ التحميل…</div>;
  if (allQ.isError)
    return <div className="text-red-600">وقع خطأ أثناء تحميل البيانات.</div>;

  /* ── واجهة ── */
  return (
    <div className="page-shell container max-w-7xl mx-auto px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">لوحة الحرفي</h1>
        <Link to="/" className="text-brand-700 hover:text-brand-800 underline">
          البحث
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <DashboardCard title="طلبات جديدة" value={kpi.newC} />
        <DashboardCard title="مقبولة" value={kpi.accC} />
        <DashboardCard title="قيد الإنجاز" value={kpi.progC} />
        <DashboardCard title="مكتملة" value={kpi.doneC} />
        <DashboardCard title="المداخيل (درهم)" value={Math.round(kpi.revenue)} />
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm text-slate-600">الطلبات خلال 7 أيام</div>
        {recharts?.LineChart ? (
          <div className="h-64">
            <recharts.ResponsiveContainer width="100%" height="100%">
              <recharts.LineChart data={weekly}>
                <recharts.CartesianGrid strokeDasharray="3 3" />
                <recharts.XAxis dataKey="date" />
                <recharts.YAxis allowDecimals={false} />
                <recharts.Tooltip />
                <recharts.Line type="monotone" dataKey="requests" stroke="#0ea5b7" strokeWidth={2} />
              </recharts.LineChart>
            </recharts.ResponsiveContainer>
          </div>
        ) : (
          <div className="text-slate-500 text-sm">
            لتفعيل الرسم البياني: <code>npm i recharts</code>
          </div>
        )}
      </div>

      {/* Recent */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm text-slate-600">آخر الطلبات</div>
        <div className="divide-y">
          {(Array.isArray(recent) ? recent : []).map((r) => (
            <div key={r.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-slate-500">
                  {r.city} • {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                </div>
              </div>
              <div className="text-sm">
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
          {(Array.isArray(recent) ? recent.length === 0 : true) && (
            <div className="text-slate-500 text-sm py-6 text-center">لا توجد طلبات بعد.</div>
          )}
        </div>
      </div>

      {/* Filters + Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            { key: "all", label: "الكل" },
            { key: "new", label: "جديد" },
            { key: "accepted", label: "مقبول" },
            { key: "in_progress", label: "قيد الإنجاز" },
            { key: "done", label: "مكتمل" },
            { key: "cancelled", label: "ملغى" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatus(opt.key)}
              className={`px-3 py-1 rounded-full border text-sm transition ${
                status === opt.key ? "bg-black text-white border-brand-600" : "hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mb-2 text-sm text-slate-600">كل الطلبات</div>
        {listQ.isLoading && <div className="text-slate-500">جارٍ التحميل…</div>}
        {listQ.isError && <div className="text-red-600">تعذّر تحميل الجدول.</div>}

        <table className="min-w-full text-sm">
          <thead className="text-right text-slate-500">
            <tr>
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">العنوان</th>
              <th className="py-2 pr-4">المدينة</th>
              <th className="py-2 pr-4">الحالة</th>
              <th className="py-2 pr-4">السعر (درهم)</th>
              <th className="py-2 pr-4">الزبون</th>
              <th className="py-2 pr-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {listAll.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-4">{r.id}</td>
                <td className="py-2 pr-4">{r.title}</td>
                <td className="py-2 pr-4">{r.city}</td>
                <td className="py-2 pr-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="py-2 pr-4">{r.price ?? "-"}</td>
                <td className="py-2 pr-4">{r.client}</td>
                <td className="py-2 pr-4">
                  <div className="flex flex-wrap gap-2">
                    {r.status === "new" && (
                      <>
                        <button className="px-3 py-1 rounded-full border text-xs" onClick={() => accept.mutate(r.id)}>
                          قبول
                        </button>
                        <button className="px-3 py-1 rounded-full border text-xs" onClick={() => cancel.mutate(r.id)}>
                          إلغاء
                        </button>
                      </>
                    )}
                    {r.status === "accepted" && (
                      <button className="px-3 py-1 rounded-full border text-xs" onClick={() => start.mutate(r.id)}>
                        بدء
                      </button>
                    )}
                    {r.status === "in_progress" && (
                      <button className="px-3 py-1 rounded-full border text-xs" onClick={() => complete.mutate(r.id)}>
                        إنهاء
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!listQ.isLoading && listAll.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
