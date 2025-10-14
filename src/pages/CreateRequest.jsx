import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

export default function CreateRequest(){
  const nav = useNavigate();
  const tech = useLocation().state?.technician;
  const [title,setTitle] = useState(tech ? `خدمة مع ${tech.fullName}` : "");
  const [city,setCity] = useState(tech?.city || "");
  const [desc,setDesc] = useState("");
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: (body)=> Api.createRequest(body),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: ["my-requests"] });
      const previous = qc.getQueryData(["my-requests"]);
      const optimistic = {
        id: Date.now(),
        title: body.title,
        city: body.city,
        description: body.description,
        technicianId: body.technicianId,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData(["my-requests"], (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.previous) qc.setQueryData(["my-requests"], ctx.previous);
      toast.error("تعذر إنشاء الطلب");
    },
    onSuccess: () => {
      toast.success("تم إنشاء الطلب بنجاح");
      nav("/requests");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["my-requests"] });
      qc.invalidateQueries({ queryKey: ["tech-dashboard"] });
      qc.invalidateQueries({ queryKey: ["tech-requests"] });
    }
  });

  const submit = () => {
    if (!title || title.trim().length < 4) return toast.error("المرجو إدخال عنوان صالح");
    if (!city || city.trim().length < 2) return toast.error("المرجو إدخال المدينة");
    if (!desc || desc.trim().length < 10) return toast.error("أدخل وصفاً مفصلاً (10 أحرف على الأقل)");
    m.mutate({ title, city, description: desc, technicianId: tech?.id });
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-xl font-semibold">إنشاء طلب خدمة</h2>
      <Card className="space-y-3">
        <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="العنوان" />
        <Input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="المدينة" />
        <textarea className="border rounded-lg px-3 py-2 w-full" rows="4" placeholder="الوصف"
                  value={desc} onChange={(e)=>setDesc(e.target.value)} />
        <div className="flex justify-end">
          <Button onClick={submit} disabled={m.isPending}>
            {m.isPending ? "جارٍ الإرسال…" : "إرسال"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
