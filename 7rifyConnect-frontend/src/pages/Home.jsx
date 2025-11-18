import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Input from "../components/Input";
import Button from "../components/Button";
import ServiceCard from "../components/ServiceCard";
import TechCard from "../components/TechCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../api/endpoints";

export default function Home() {
  const queryClient = useQueryClient();
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

  const parent = r ? {} : { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { staggerChildren: .06 } } };
  const item   = r ? {} : { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

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

  const { data: topTechs = [], isFetching: loadingTopTechs, isError: errTopTechs } = useQuery({
    queryKey: ["top-techs"],
    queryFn: Api.getTopTechnicians,
  });
  const { data: topServices = [], isFetching: loadingTopServices, isError: errTopServices } = useQuery({
    queryKey: ["top-services"],
    queryFn: Api.getTopServices,
  });

  const verifiedTopTechs = useMemo(
    () =>
      Array.isArray(topTechs)
        ? topTechs.filter((tech) => Boolean(tech?.isVerified ?? tech?.is_verified ?? tech?.verified))
        : [],
    [topTechs]
  );

  return (
    <div className="space-y-0 [&>section]:scroll-mt-24" dir="rtl">

      {/* HERO — خلفية ممتدة + محتوى boxed + طول أكبر */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#EEF5FF] via-white to-[#F7FBFF]" />
        <div aria-hidden className="pointer-events-none select-none">
          <div className="absolute -top-24 -left-20 h-56 w-56 rounded-full bg-brand-300/35 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-300/35 blur-3xl" />
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 md:py-36 lg:py-40">
          <motion.div variants={parent} initial="hidden" animate="show">
            <motion.h1 variants={item} className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              نقرّب ليك أحسن الحرفيين القريبين ليك
            </motion.h1>
            <motion.p variants={item} className="mt-3 text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
              بحث ذكي حسب التخصص والمدينة، وشوف التقييمات قبل ما تتواصل.
            </motion.p>

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
                <Button type="submit" aria-label="ابدأ البحث" className="mt-2 whitespace-nowrap bg-brand-600 hover:bg-brand-700 text-white shadow-soft">
                  بحث
                </Button>
              </motion.div>
            </motion.form>

            <motion.div variants={item} className="mt-3">
              <Link to="/search" className="text-brand-700 hover:text-brand-800 hover:underline">
                أو شوف الكل
              </Link>
            </motion.div>

            <motion.div variants={item} className="mt-6">
              <div className="mx-auto inline-flex items-center gap-3 rounded-full bg-white/80 backdrop-blur px-4 py-2 border border-slate-200 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-accent-500" />
                <span className="text-sm text-slate-700">+1,000 زبون راضين خلال آخر 30 يوم</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* WHY US — محتوى boxed داخل خلفية رمادية */}
      <section className="bg-slate-50 border-t border-slate-200/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-6 md:pb-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">ليش تختار منصّتنا؟</h2>
            <span className="hidden md:block text-sm text-slate-500">موثوقية عالية، تجربة سهلة وسريعة</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
        </div>
      </section>

      {/* HOW IT WORKS — boxed */}
      <section className="bg-white border-t border-slate-100">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-6 md:pb-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">كيف خدامة؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
        </div>
      </section>

      {/* Top Technicians */}
      <section className="full-bleed bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl pt-10 md:pt-14 pb-6 md:pb-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">أعلى الحرفيين تقييماً</h2>
            <span className="hidden md:block text-sm text-slate-500">أفضل خبراء قريبين منك</span>
          </div>

          {/* Error state */}
          {errTopTechs && !loadingTopTechs && (
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 text-right">
              تعذّر تحميل القائمة.
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["top-techs"] })}
                className="ms-3 underline"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Empty state */}
          {!errTopTechs && !loadingTopTechs && verifiedTopTechs.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 text-center">
              لا توجد بيانات متاحة.
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Skeletons */}
            {loadingTopTechs &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                  </div>
                  <div className="mt-3 h-3 w-40 bg-slate-200 rounded" />
                  <div className="mt-4 h-8 w-full bg-slate-200 rounded" />
                </div>
              ))}

            {/* Cards */}
            {!loadingTopTechs && !errTopTechs &&
              verifiedTopTechs.map((t) => <TechCard key={t.id} t={t} />)}
          </div>
        </div>
      </section>

      {/* Top Services — boxed */}
      <section className="bg-slate-50 border-t border-slate-200/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-6 md:pb-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">خدمات مطلوبة</h2>
            <span className="hidden md:block text-sm text-slate-500">ابحث بسرعة بالخدمة</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loadingTopServices && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl border border-slate-200 bg-white animate-pulse" />
            ))}
            {!loadingTopServices && !errTopServices && (Array.isArray(topServices) ? topServices : []).map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
            {!loadingTopServices && (Array.isArray(topServices) ? topServices.length === 0 : true) && !errTopServices && (
              <div className="col-span-full text-center text-slate-500">لا توجد بيانات متاحة</div>
            )}
            {errTopServices && !loadingTopServices && (
              <div className="col-span-full text-center text-red-600">تعذر تحميل القائمة</div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES — boxed */}
      <section className="bg-white border-t border-slate-100">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-6 md:pb-8">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">أشهر التخصصات</h2>
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2" role="list">
            {["كهربائي","سبّاك","نجّار","صبّاغ","حدّاد","ألمنيوم"].map((c) => (
              <Link
                key={c}
                role="listitem"
                to={`/search?q=${encodeURIComponent(c)}`}
                className="shrink-0 snap-start px-4 py-2 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-brand-50 hover:border-brand-300 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                aria-label={`تصنيف ${c}`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — boxed داخل خلفية ممتدة */}
      <section className="border-t border-slate-100">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-10 md:pb-12">
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
        </div>
      </section>

    </div>
  );
}


