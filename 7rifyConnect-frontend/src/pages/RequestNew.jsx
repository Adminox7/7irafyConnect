import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Api } from "../api/endpoints";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { useNavigate, useLocation } from "react-router-dom";

export default function RequestNew() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const location = useLocation();
  const draft = useMemo(() => location.state?.draft ?? null, [location.state]);
  const [title, setTitle] = useState(draft?.title || "");
  const [city, setCity] = useState(draft?.city || "");
  const [description, setDescription] = useState(draft?.description || "");
  const [budget, setBudget] = useState(draft?.budget ? String(draft.budget) : "");
  const [attachments, setAttachments] = useState(
    draft?.attachments?.length ? draft.attachments.join(", ") : ""
  );

  const create = useMutation({
    mutationFn: (body) => Api.createRequest(body),
    onSuccess: () => {
      toast.success("تم إرسال طلبك");
      qc.invalidateQueries({ queryKey: ["my-requests"] });
      nav("/requests");
    },
    onError: () => toast.error("تعذر إنشاء الطلب"),
  });

  const submit = () => {
    if (!title.trim() || title.length < 4) return toast.error("أدخل عنواناً واضحاً (4 أحرف أو أكثر)");
    if (!city.trim() || city.length < 2) return toast.error("المدينة مطلوبة");
    if (!description.trim() || description.length < 10) return toast.error("الوصف قصير جداً");
    const budgetValue = budget ? Number(budget) : undefined;
    const attachmentsList = attachments
      ? attachments
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : undefined;

    create.mutate({
      title,
      city,
      description,
      budget: budgetValue,
      attachments: attachmentsList,
    });
  };

  return (
    <div className="page-shell container max-w-5xl mx-auto px-4 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">طلب خدمة جديد</h1>
        <Button
          variant="ghost"
          className="border border-slate-200"
          onClick={() => nav("/requests")}
        >
          العودة إلى طلباتي
        </Button>
      </div>

      <Card className="space-y-4 p-6">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الخدمة" />
        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة" />
        <Input
          type="number"
          min="0"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="الميزانية (اختياري)"
        />
        <textarea
          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          rows={4}
          placeholder="وصف مفصل لما تحتاجه"
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
            disabled={create.isPending}
            className="bg-brand-600 text-white hover:bg-brand-700"
          >
            {create.isPending ? "جارٍ الإرسال..." : "إرسال الطلب"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
