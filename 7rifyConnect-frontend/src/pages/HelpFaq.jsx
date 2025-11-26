import StaticPage from "./StaticPage";

const faqs = [
  { q: "كيف أسجل كحرفي؟", a: "اضغط على إنشاء حساب، اختر حرفي، أضف بياناتك ووثائق التحقق." },
  { q: "كيف أطلب خدمة؟", a: "من صفحة البحث اختر الحرفي، ثم اضغط اطلب الآن وأرسل التفاصيل." },
  { q: "كيف أتواصل مع الدعم؟", a: "راسلنا على support@7rifyconnect.ma أو عبر صفحة المساعدة." },
];

export default function HelpFaq() {
  return (
    <StaticPage title="الأسئلة المتكررة">
      <ul className="space-y-4">
        {faqs.map((f) => (
          <li key={f.q} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">{f.q}</h2>
            <p className="text-slate-700 mt-1">{f.a}</p>
          </li>
        ))}
      </ul>
    </StaticPage>
  );
}
