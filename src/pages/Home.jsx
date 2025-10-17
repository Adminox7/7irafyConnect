import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Home() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const nav = useNavigate();
  const r = useReducedMotion();

  const go = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (city) p.set("city", city);
    nav(`/search?${p.toString()}`);
  };

  // animations
  const parent = r ? {} : { hidden: {opacity:0, y:14}, show: {opacity:1, y:0, transition:{staggerChildren:.06}} };
  const item   = r ? {} : { hidden: {opacity:0, y:10}, show: {opacity:1, y:0} };

  const features = [
    { t: "سريع", s: "تواصل فوري", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <path d="M3 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { t: "موثوق", s: "مراجعات وملفات", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <path d="M6 12l3 3 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { t: "قريب منك", s: "حسب المدينة", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <path d="M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2"/>
        <path d="M4.5 20a8.5 8.5 0 0115 0" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )},
    { t: "أسعار شفافة", s: "بدون مفاجآت", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <path d="M12 1v22M7 5h10M5 12h14M7 19h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )},
    { t: "تقييمات", s: "آراء حقيقية", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    )},
    { t: "دعم", s: "خدمة مساعدة", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <path d="M12 22s8-4 8-10a8 8 0 10-16 0c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    )},
  ];

  const categories = ["كهربائي", "سبّاك", "نجّار", "صبّاغ", "حدّاد", "ألمنيوم"];

  return (
    
    <div className="space-y-20" dir="rtl">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* background gradient band */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-white" />
        {/* soft decor blobs */}
        <div aria-hidden className="pointer-events-none select-none">
          <div className="absolute -top-24 -left-20 h-56 w-56 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-300/40 blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto text-center py-16 md:py-24">
          <motion.div variants={parent} initial="hidden" animate="show">
            <motion.h1 variants={item} className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              نقرّب ليك أحسن الحرفيين القريبين ليك
            </motion.h1>
            <motion.p variants={item} className="mt-3 text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
              بحث ذكي حسب التخصص والمدينة، وشوف التقييمات قبل ما تتواصل.
            </motion.p>

            {/* search */}
            <motion.form
              variants={item}
              onSubmit={go}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto"
              aria-label="محرك البحث"
            >
              <Input
                aria-label="ابحث عن تخصص"
                placeholder="مثال: كهربائي"
                value={q}
                onChange={(e)=>setQ(e.target.value)}
                className="flex-1"
              />
              <Input
                aria-label="المدينة"
                placeholder="المدينة"
                value={city}
                onChange={(e)=>setCity(e.target.value)}
                className="sm:w-44"
              />
              <motion.div whileHover={r ? undefined : { scale: 1.02 }}>
                <Button type="submit" aria-label="ابدأ البحث" className="whitespace-nowrap">بحث</Button>
              </motion.div>
            </motion.form>

            <motion.div variants={item} className="mt-3">
              <Link to="/search" className="text-brand-700 hover:text-brand-800 hover:underline">
                أو شوف الكل
              </Link>
            </motion.div>

            {/* trust strip */}
            <motion.div variants={item} className="mt-10">
              <div className="mx-auto inline-flex items-center gap-3 rounded-full bg-white/80 backdrop-blur px-4 py-2 border border-slate-200 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-700">+1,000 زبون راضين خلال آخر 30 يوم</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* WHY US */}
      <section className="container max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">ليش تختار منصّتنا؟</h2>
          <span className="hidden md:block text-sm text-slate-500">موثوقية عالية، تجربة سهلة وسريعة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.t}
              initial={r ? false : { opacity: 0, y: 8 }}
              whileInView={r ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .2 }}
              whileHover={r ? undefined : { y: -6, scale: 1.01 }}
              transition={{ type:"spring", stiffness:260, damping:18, delay:i*0.03 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg text-right"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  {f.icon}
                </div>
                <div className="text-lg font-semibold text-slate-900">{f.t}</div>
              </div>
              <div className="text-slate-600 text-sm mt-2 leading-relaxed">{f.s}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">كيف خدامة؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["بحث", "اختيار", "تواصل"].map((step, i) => (
            <motion.div
              key={step}
              initial={r ? false : { opacity: 0, y: 10 }}
              whileInView={r ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .2 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-l from-brand-600 to-brand-400 text-white flex items-center justify-center font-semibold">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{step}</h3>
              </div>
              <p className="text-slate-600 text-sm mt-2">
                {i === 0 && "كتب التخصص والمدينة"} 
                {i === 1 && "قارن الملفات والتقييمات"} 
                {i === 2 && "تواصل مباشرة وخذ موعد"}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">أشهر التخصصات</h2>
        <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2" role="list">
          {categories.map((c) => (
            <Link
              key={c}
              role="listitem"
              to={`/search?q=${encodeURIComponent(c)}`}
              className="shrink-0 snap-start px-4 py-2 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-brand-50 hover:border-brand-300 shadow-sm"
              aria-label={`تصنيف ${c}`}
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-6xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-l from-brand-700 to-brand-600 text-white p-8 md:p-10 text-center shadow-md">
          <h2 className="text-white font-bold tracking-tight text-2xl">جاهز تبدا؟</h2>
          <p className="mt-1 text-white/90">اكتشف الحرفيين القريبين ليك أو سجّل كحرفي</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.div whileHover={r ? undefined : { scale: 1.02 }}>
              <Link
                to="/search"
                className="inline-flex items-center justify-center px-5 py-2 rounded-2xl bg-white text-brand-700 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                إلى صفحة البحث
              </Link>
            </motion.div>
            <motion.div whileHover={r ? undefined : { scale: 1.02 }}>
              <Link
                to="/register?role=technicien"
                className="inline-flex items-center justify-center px-5 py-2 rounded-2xl border border-white/80 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                سجّل كحرفي
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
