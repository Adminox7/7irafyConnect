import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import { useAuthStore } from "../stores/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

const normalize = (r) => ({
  id: r.id ?? r.request_id,
  title: r.title ?? "طلب خدمة",
  city: r.city ?? "-",
  description: r.description ?? "",
  budget: r.budget ?? r.price ?? null,
  status: r.status ?? r.state ?? "new",
  createdAt: r.created_at ?? r.createdAt ?? null,
  client: r.client_name ?? r.client ?? "-",
});

export default function RequestsBoard() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const nav = useNavigate();

  const [typeFilter, setTypeFilter] = useState("");
  const [dateOrder, setDateOrder] = useState("desc");

  const requestsQ = useQuery({
    queryKey: ["tech-requests-board"],
    queryFn: () => Api.getTechRequests({ status: "new" }),
  });

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [attachments, setAttachments] = useState("");

  const createMutation = useMutation({
    mutationFn: (body) => Api.createRequest(body),
    onSuccess: () => {
      toast.success("تم نشر الطلب");
      setTitle("");
      setCity("");
      setDescription("");
      setBudget("");
      setAttachments("");
      qc.invalidateQueries({ queryKey: ["tech-requests-board"] });
      qc.invalidateQueries({ queryKey: ["tech-requests"] });
    },
    onError: () => toast.error("تعذر نشر الطلب"),
  });

  const submit = () => {
    if (!title.trim() || title.length < 4) return toast.error("أدخل عنواناً واضحاً");
    if (!city.trim()) return toast.error("المدينة مطلوبة");
    if (!description.trim() || description.length < 10) return toast.error("الوصف قصير جداً");
    const budgetValue = budget ? Number(budget) : undefined;
    const attachmentsList = attachments
      ? attachments
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : undefined;
    createMutation.mutate({
      title,
      city,
      description,
      budget: budgetValue,
      attachments: attachmentsList,
    });
  };

  const items = useMemo(
    () => (Array.isArray(requestsQ.data) ? requestsQ.data.map(normalize) : []),
    [requestsQ.data]
  );

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const byType = typeFilter
      ? list.filter((r) =>
          `${r.title} ${r.description}`.toLowerCase().includes(typeFilter.toLowerCase())
        )
      : list;
    return byType.sort((a, b) => {
      const A = a.createdAt ? +new Date(a.createdAt) : 0;
      const B = b.createdAt ? +new Date(b.createdAt) : 0;
      return dateOrder === "asc" ? A - B : B - A;
    });
  }, [items, typeFilter, dateOrder]);

  const showForm = user?.role !== "technicien";

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4 space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">أهلاً {user?.fullName || user?.name || "حِرَفي"}</p>
          <h1 className="text-2xl font-bold text-slate-900">الطلبات المفتوحة</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">نوع الخدمة</label>
            <Input
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              placeholder="بحث حسب النوع"
              className="min-w-[180px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">ترتيب التاريخ</label>
            <select
              value={dateOrder}
              onChange={(e) => setDateOrder(e.target.value)}
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="desc">الأحدث أولاً</option>
              <option value="asc">الأقدم أولاً</option>
            </select>
          </div>
          <Button onClick={() => nav("/create-request")} className="bg-brand-600 text-white hover:bg-brand-700">
            طلب نيابة عن العميل
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showForm ? "lg:grid-cols-[1.1fr,0.9fr]" : ""}`}>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">لوحة الطلبات</h2>
            {requestsQ.isFetching && <span className="text-sm text-slate-500">...تحديث</span>}
          </div>

          {requestsQ.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              تعذر تحميل الطلبات.
              <button
                type="button"
                onClick={() => requestsQ.refetch()}
                className="ms-2 underline font-semibold"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {!requestsQ.isError && filtered.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600 text-center">
              لا توجد طلبات مفتوحة حالياً.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">{r.city}</div>
                  {r.budget && (
                    <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 border border-accent-200">
                      الميزانية: {r.budget}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{r.title}</h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">{r.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>صاحب الطلب: {r.client}</span>
                  {r.createdAt && <span>{new Date(r.createdAt).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {showForm && (
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">نشر طلب خدمة (أسلوب Upwork)</h2>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الخدمة" />
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة" />
            <Input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="الميزانية (اختياري)"
              type="number"
              min="0"
            />
            <textarea
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              rows={4}
              placeholder="وصف الطلب بالتفصيل"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              value={attachments}
              onChange={(e) => setAttachments(e.target.value)}
              placeholder="روابط صور/مرفقات (افصل بينها بفاصلة)"
            />
            <div className="flex justify-end">
              <Button
                onClick={submit}
                disabled={createMutation.isPending}
                className="bg-brand-600 text-white hover:bg-brand-700"
              >
                {createMutation.isPending ? "جارٍ النشر..." : "نشر الطلب"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
