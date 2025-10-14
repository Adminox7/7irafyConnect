import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Home() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const nav = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const go = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    nav(`/search?${params.toString()}`);
  };

  const containerVariants = prefersReducedMotion ? {} : {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = prefersReducedMotion ? {} : {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  const features = [
    { t: "سريع", s: "تواصل فوري", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { t: "موثوق", s: "مراجعات وملفات", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 12l3 3 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { t: "قريب منك", s: "حسب المدينة", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2"/>
        <path d="M4.5 20a8.5 8.5 0 0115 0" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )},
    { t: "أسعار شفافة", s: "بدون مفاجآت", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 1v22M7 5h10M5 12h14M7 19h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )},
    { t: "تقييمات", s: "آراء حقيقية", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    )},
    { t: "دعم", s: "خدمة مساعدة", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10a8 8 0 10-16 0c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    )},
  ];

  const categories = ["كهربائي", "سبّاك", "نجّار", "صبّاغ", "حدّاد", "ألمنيوم"];

  return (
    <div className="space-y-16" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-brand-50 to-white p-10">
        {/* decorative */}
        <div className="pointer-events-none select-none" aria-hidden="true">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-brand-200 blur-3xl opacity-60" />
          <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-brand-300 blur-3xl opacity-60" />
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center relative"
        >
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-l from-brand-600 to-brand-400 bg-clip-text text-transparent">7irafyConnect</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-700 text-lg">
            نقرّب ليك أحسن الحرفيين القريبين ليك
          </motion.p>
          <motion.form
            variants={itemVariants}
            onSubmit={go}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
            aria-label="محرك البحث"
          >
            <Input
              aria-label="ابحث عن تخصص"
              placeholder="مثال: كهربائي"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Input
              aria-label="المدينة"
              placeholder="المدينة"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="sm:w-40"
            />
            <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}>
              <Button type="submit" aria-label="ابدأ البحث">بحث</Button>
            </motion.div>
          </motion.form>
          <motion.div variants={itemVariants} className="mt-3 text-sm text-slate-600">
            <Link to="/search" className="text-brand hover:underline">أو شوف الكل</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold mb-6">ليش تختار منصّتنا؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.05 }}
              whileHover={prefersReducedMotion ? undefined : { y: -4, rotate: 0.25 }}
              className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-lg text-right"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  {f.icon}
                </div>
                <div className="text-lg font-semibold">{f.t}</div>
              </div>
              <div className="text-slate-600 text-sm mt-2">{f.s}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-2xl font-bold mb-6">كيف خدامة؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["بحث", "اختيار", "تواصل"].map((step, i) => (
            <motion.div
              key={step}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="rounded-2xl border bg-white p-6 shadow-sm text-right"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-l from-brand-600 to-brand-400 text-white flex items-center justify-center font-semibold">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold">{step}</h3>
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

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-4">أشهر التخصصات</h2>
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2" role="list">
            {categories.map((c) => (
              <Link
                key={c}
                role="listitem"
                to={`/search?q=${encodeURIComponent(c)}`}
                className="shrink-0 snap-start px-4 py-2 rounded-full border bg-white text-slate-700 hover:text-brand hover:border-brand/40 shadow-sm"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-l from-brand-600 to-brand-400 text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">جاهز تبدا؟</h2>
        <p className="text-brand-50/90">اكتشف الحرفيين القريبين ليك أو سجّل كحرفي</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}>
            <Link
              to="/search"
              className="inline-flex items-center justify-center px-5 py-2 rounded-2xl bg-white text-brand-700 shadow-sm hover:shadow-md"
            >
              إلى صفحة البحث
            </Link>
          </motion.div>
          <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}>
            <Link
              to="/register?role=technicien"
              className="inline-flex items-center justify-center px-5 py-2 rounded-2xl border border-white/70 text-white hover:bg-white/10"
            >
              سجّل كحرفي
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
