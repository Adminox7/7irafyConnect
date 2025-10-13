import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

export default function CreateRequest(){
  const nav = useNavigate();
  const tech = useLocation().state?.technician;
  const [title,setTitle] = useState(tech ? `خدمة مع ${tech.fullName}` : "");
  const [city,setCity] = useState(tech?.city || "");
  const [desc,setDesc] = useState("");

  const m = useMutation({
    mutationFn: (body)=> axios.post("/api/v1/requests", body).then(r=>r.data),
    onSuccess: ()=> nav("/requests")
  });

  return (
    <div className="max-w-xl space-y-3">
      <h2 className="text-xl font-semibold">إنشاء طلب خدمة</h2>
      <input className="border rounded-lg px-3 py-2 w-full" placeholder="العنوان"
             value={title} onChange={e=>setTitle(e.target.value)} />
      <input className="border rounded-lg px-3 py-2 w-full" placeholder="المدينة"
             value={city} onChange={e=>setCity(e.target.value)} />
      <textarea className="border rounded-lg px-3 py-2 w-full" rows="4" placeholder="الوصف"
                value={desc} onChange={e=>setDesc(e.target.value)} />
      <button onClick={()=>m.mutate({ title, city, description:desc, technicianId: tech?.id })}
              className="px-4 py-2 bg-cyan-700 text-white rounded-lg">
        إرسال
      </button>
    </div>
  );
}
