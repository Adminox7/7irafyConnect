import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import Tabs from "../components/Tabs";
import RatingStars from "../components/RatingStars";
import Chip from "../components/Chip";

export default function TechnicianProfile(){
  const { id } = useParams();
  const { data:t, isLoading, isError } = useQuery({
    queryKey:["tech", id],
    queryFn: () => Api.getTechnician(id)
  });
  const { data: reviews = [], isError: errReviews } = useQuery({
    queryKey: ["tech", id, "reviews"],
    queryFn: () => Api.getTechnicianReviews(id),
  });
  const { data: services = [], isError: errServices } = useQuery({
    queryKey: ["tech", id, "services"],
    queryFn: () => Api.getTechnicianServices(id),
  });

  if (isLoading) return <div className="text-slate-500">جارٍ التحميل…</div>;
  if (isError) return <div className="text-red-600">وقع خطأ. حاول لاحقاً.</div>;
  if (!t) return <div>ما لقايناهش</div>;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-brand-100 grid place-items-center text-brand-700 font-bold">
              {t.fullName?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{t.fullName}</h1>
              <div className="text-sm text-slate-600">{t.city} • {t.specialties?.join(", ")}</div>
              <div className="flex items-center gap-2 mt-1">
                <RatingStars value={t.averageRating || 0} />
                <span className="text-xs text-slate-600">{t.averageRating?.toFixed ? t.averageRating.toFixed(1) : t.averageRating}</span>
                {t.isPremium && <span className="text-amber-600 text-xs">★ بريميوم</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/chat`} className="px-3 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50">دردشة</a>
            <a href={`tel:0600000000`} className="px-3 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50">اتصال</a>
            <Link to={`/create-request?technicianId=${t.id}`} className="px-3 py-2 rounded-2xl bg-brand-600 text-white hover:bg-brand-700">حجز خدمة</Link>
          </div>
        </div>
      </section>

      {/* Availability & visit price (mocked) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-600 mb-2">التوفر هذا الأسبوع</div>
          <div className="flex flex-wrap gap-2">
            {"الأحد الإثنين الثلاثاء الأربعاء الخميس الجمعة السبت".split(" ").map((d, i) => (
              <Chip key={d} selected={i % 2 === 0}>{d}</Chip>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-600 mb-2">سعر الزيارة</div>
          <div className="text-2xl font-bold text-slate-900">150 درهم</div>
        </div>
      </section>

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            key: "about",
            label: "نبذة",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-2">
                <div className="text-slate-700 leading-relaxed">{t.bio || "حرفي محترف يقدم خدمات بجودة عالية"}</div>
                <div className="text-sm text-slate-600">يغطي المدن: {t.city}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {t.specialties?.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              </div>
            ),
          },
          {
            key: "services",
            label: "الخدمات",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Array.isArray(services) ? services : []).map((s) => (
                    <div key={s.id} className="rounded-xl border p-3">
                      <div className="font-medium text-slate-900">{s.title}</div>
                      {s.priceFrom && (
                        <div className="text-sm text-slate-600 mt-1">{s.priceFrom} - {s.priceTo || s.priceFrom} درهم</div>
                      )}
                    </div>
                  ))}
                  {(Array.isArray(services) ? services.length === 0 : true) && !errServices && (
                    <div className="text-sm text-slate-500">لا خدمات معلنة</div>
                  )}
                  {errServices && (
                    <div className="text-sm text-red-600">تعذر تحميل الخدمات</div>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "reviews",
            label: "الآراء",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
                {(Array.isArray(reviews) ? reviews : []).map((r) => (
                  <div key={r.id} className="border rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-900">{r.author}</div>
                      <RatingStars value={r.rating} />
                    </div>
                    <div className="text-sm text-slate-700 mt-1">{r.comment}</div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(r.date).toLocaleDateString()}</div>
                  </div>
                ))}
                {(Array.isArray(reviews) ? reviews.length === 0 : true) && !errReviews && (
                  <div className="text-sm text-slate-500">لا توجد آراء بعد</div>
                )}
                {errReviews && (
                  <div className="text-sm text-red-600">تعذر تحميل الآراء</div>
                )}
              </div>
            ),
          },
          {
            key: "portfolio",
            label: "الصور",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(t.portfolio || []).map((p) => (
                    <img key={p.id} src={p.url} alt="work" className="rounded-xl object-cover aspect-[4/3]" />
                  ))}
                  {(!t.portfolio || t.portfolio.length === 0) && (
                    <div className="text-sm text-slate-500">لا توجد صور</div>
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
