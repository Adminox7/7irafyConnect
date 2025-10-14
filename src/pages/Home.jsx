import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Home() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const nav = useNavigate();

  const go = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    nav(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-10" dir="rtl">
      {/* Hero */}
      <div className="rounded-2xl bg-brand/10 p-10 text-center">
        <div className="text-3xl font-bold text-brand mb-3">7irafyConnect</div>
        <div className="text-slate-700">نقرّب ليك أحسن الحرفيين القريبين ليك</div>
        <form onSubmit={go} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <input className="border rounded-lg px-3 py-2 w-full text-right" placeholder="مثال: كهربائي" value={q} onChange={(e)=>setQ(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 w-full text-right sm:w-40" placeholder="المدينة" value={city} onChange={(e)=>setCity(e.target.value)} />
          <button className="bg-brand text-white rounded-lg px-6 py-2 hover:bg-brand-700" type="submit">بحث</button>
        </form>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{t:"سريع",s:"تواصل فوري"},{t:"موثوق",s:"مراجعات وملفات"},{t:"قريب منك",s:"حسب المدينة"}].map((f,i)=> (
          <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm text-center">
            <div className="text-xl font-semibold mb-1">{f.t}</div>
            <div className="text-slate-600 text-sm">{f.s}</div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-slate-600">
        <Link to="/search" className="text-brand underline">إلى صفحة البحث</Link>
      </div>
    </div>
  );
}
