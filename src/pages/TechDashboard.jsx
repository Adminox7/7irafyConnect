import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DashboardCard from "../components/DashboardCard";
import { Link } from "react-router-dom";

// رسم بياني بسيط (اختياري)
let LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid;
try {
  // dynamic import to avoid crash if recharts not installed
  ({ LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = await import("recharts"));
} catch (e) {}

export default function TechDashboard(){
  const { data, isLoading } = useQuery({
    queryKey: ["tech-dashboard"],
    queryFn: async () => (await axios.get("/api/v1/tech/dashboard")).data
  });

  const { data: listAll = [] } = useQuery({
    queryKey: ["tech-requests", "all"],
    queryFn: async () => (await axios.get("/api/v1/tech/requests?status=all")).data
  });

  if (isLoading) return <div>جارٍ التحميل…</div>;

  const kpi = data?.kpi || { newC:0, accC:0, progC:0, doneC:0, revenue:0 };
  const recent = data?.recent || [];
  const weekly = data?.weekly || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة الحرفي</h1>
        <Link to="/" className="text-cyan-700 underline">البحث</Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <DashboardCard title="طلبات جديدة" value={kpi.newC} />
        <DashboardCard title="مقبولة" value={kpi.accC} />
        <DashboardCard title="قيد الإنجاز" value={kpi.progC} />
        <DashboardCard title="مكتملة" value={kpi.doneC} />
        <DashboardCard title="المداخيل (درهم)" value={kpi.revenue.toFixed(0)} />
      </div>

      {/* Chart / or fallback */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm text-slate-600">الطلبات خلال 7 أيام</div>
        {LineChart ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#0ea5b7" strokeWidth={2}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-slate-500 text-sm">لتفعيل الرسم البياني: <code>npm i recharts</code></div>
        )}
      </div>

      {/* Recent Requests */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm text-slate-600">آخر الطلبات</div>
        <div className="divide-y">
          {recent.map(r => (
            <div key={r.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-slate-500">{r.city} • {new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full bg-slate-100">{r.status}</span>
              </div>
            </div>
          ))}
          {recent.length === 0 && <div className="text-slate-500 text-sm py-6 text-center">لا توجد طلبات بعد.</div>}
        </div>
      </div>

      {/* All Requests Table */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm overflow-x-auto">
        <div className="mb-2 text-sm text-slate-600">كل الطلبات</div>
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">العنوان</th>
              <th className="py-2 pr-4">المدينة</th>
              <th className="py-2 pr-4">الحالة</th>
              <th className="py-2 pr-4">السعر (درهم)</th>
              <th className="py-2 pr-4">الزبون</th>
            </tr>
          </thead>
          <tbody>
            {listAll.map(r => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-4">{r.id}</td>
                <td className="py-2 pr-4">{r.title}</td>
                <td className="py-2 pr-4">{r.city}</td>
                <td className="py-2 pr-4"><span className="px-2 py-1 rounded-full bg-slate-100">{r.status}</span></td>
                <td className="py-2 pr-4">{r.price ?? "-"}</td>
                <td className="py-2 pr-4">{r.client}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
