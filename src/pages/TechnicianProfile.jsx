import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import Tabs from "../components/Tabs";
import RatingStars from "../components/RatingStars";
import Chip from "../components/Chip";
import { useState } from "react";
import AvatarUpload from "../components/AvatarUpload";
import toast from "react-hot-toast";

export default function TechnicianProfile() {
  const { id } = useParams();
  const nav = useNavigate();

  // ✅ Hooks لازم يكونو ديما قبل أي return مشروط
  const [portfolio, setPortfolio] = useState([]);

  const {
    data: t,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tech", id],
    queryFn: () => Api.getTechnician(id),
    enabled: !!id,
  });

  const {
    data: reviews = [],
    isError: errReviews,
  } = useQuery({
    queryKey: ["tech", id, "reviews"],
    queryFn: () => Api.getTechnicianReviews(id),
    enabled: !!id,
  });

  const {
    data: services = [],
    isError: errServices,
  } = useQuery({
    queryKey: ["tech", id, "services"],
    queryFn: () => Api.getTechnicianServices(id),
    enabled: !!id,
  });

  // Handlers
  function addImage(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPortfolio((prev) => [...prev, url]);
  }

  function removeImage(index) {
    setPortfolio((prev) => prev.filter((_, i) => i !== index));
  }

  // Early returns آمنة دابا حيث جميع الHooks فوق
  if (isLoading) {
    return (
      <div className="page-shell container max-w-7xl mx-auto px-4" dir="rtl">
        <div className="h-28 rounded-2xl border border-slate-200 bg-white animate-pulse mt-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-shell container max-w-7xl mx-auto px-4" dir="rtl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 mt-6">
          وقع خطأ. حاول لاحقاً.
        </div>
      </div>
    );
  }

  if (!t) {
    return (
      <div className="page-shell container max-w-7xl mx-auto px-4" dir="rtl">
        <div className="rounded-2xl border bg-white p-6 mt-6">ما لقايناهش</div>
      </div>
    );
  }

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4 space-y-6" dir="rtl">
      {/* Header */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AvatarUpload value={t.avatarUrl} placeholder={t.fullName?.[0] || "ح"} />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{t.fullName}</h1>
              <div className="text-sm text-slate-600">
                {t.city} • {Array.isArray(t.specialties) ? t.specialties.join(", ") : ""}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <RatingStars value={t.averageRating || 0} />
                <span className="text-xs text-slate-600">
                  {typeof t.averageRating === "number"
                    ? t.averageRating.toFixed(1)
                    : t.averageRating}
                </span>
                {t.isPremium && <span className="text-amber-600 text-xs">★ بريميوم</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  const th = await Api.createThread(t.id);
                  nav(`/chat/${th.id}`);
                } catch {
                  toast.error("تعذر فتح الدردشة");
                }
              }}
              className="px-3 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              مراسلة
            </button>
            <a
              href={`tel:0600000000`}
              className="px-3 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              اتصال
            </a>
            <Link
              to={`/create-request?technicianId=${t.id}`}
              className="px-3 py-2 rounded-2xl bg-brand-600 text-white hover:bg-brand-700"
            >
              حجز خدمة
            </Link>
          </div>
        </div>
      </section>

      {/* Availability & visit price (mocked) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-600 mb-2">التوفر هذا الأسبوع</div>
          <div className="flex flex-wrap gap-2">
            {"الأحد الإثنين الثلاثاء الأربعاء الخميس الجمعة السبت"
              .split(" ")
              .map((d, i) => (
                <Chip key={d} selected={i % 2 === 0}>
                  {d}
                </Chip>
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
                <div className="text-slate-700 leading-relaxed">
                  {t.bio || "حرفي محترف يقدم خدمات بجودة عالية"}
                </div>
                <div className="text-sm text-slate-600">يغطي المدن: {t.city}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(Array.isArray(t.specialties) ? t.specialties : []).map((s) => (
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
                        <div className="text-sm text-slate-600 mt-1">
                          {s.priceFrom} - {s.priceTo || s.priceFrom} درهم
                        </div>
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
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(r.date).toLocaleDateString()}
                    </div>
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {portfolio.map((src, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border">
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img src={src} className="h-40 w-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-white bg-black/50 rounded-full p-1"
                        aria-label="حذف الصورة"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <label className="h-40 border rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50">
                    + إضافة صورة
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = (e.target.files && e.target.files[0]) || null;
                        if (file) addImage(file);
                      }}
                    />
                  </label>
                </div>
                {portfolio.length === 0 && (
                  <div className="text-sm text-slate-500 mt-2">لا توجد صور بعد</div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
