import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import Tabs from "../components/Tabs";
import RatingStars from "../components/RatingStars";
import Chip from "../components/Chip";
import AvatarUpload from "../components/AvatarUpload";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/auth";
import { http } from "../api/http";

export default function TechnicianProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, token } = useAuthStore();

  /* ─────────────── QUERIES ─────────────── */
  const techQ = useQuery({
    queryKey: ["tech", id],
    queryFn: () => Api.getTechnician(id),
    enabled: !!id,
  });

  const reviewsQ = useQuery({
    queryKey: ["tech", id, "reviews"],
    queryFn: () => Api.getTechnicianReviews(id),
    enabled: !!id,
  });

  const servicesQ = useQuery({
    queryKey: ["tech", id, "services"],
    queryFn: () => Api.getTechnicianServices(id),
    enabled: !!id,
  });

  const portfolioQ = useQuery({
    queryKey: ["tech", id, "portfolio"],
    queryFn: () => Api.getTechnicianPortfolio(id),
    enabled: !!id,
  });

  /* ─────────────── LOADING / ERROR STATES ─────────────── */
  if (techQ.isLoading) {
    return (
      <div className="page-shell container max-w-7xl mx-auto px-4" dir="rtl">
        <div className="h-28 rounded-2xl border border-slate-200 bg-white animate-pulse mt-6" />
      </div>
    );
  }

  if (techQ.isError) {
    return (
      <div className="page-shell container max-w-7xl mx-auto px-4" dir="rtl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 mt-6">
          وقع خطأ. حاول لاحقاً.
        </div>
      </div>
    );
  }

  const t = techQ.data;
  if (!t) {
    return (
      <div className="page-shell container max-w-7xl mx-auto px-4" dir="rtl">
        <div className="rounded-2xl border bg-white p-6 mt-6">ما لقايناهش</div>
      </div>
    );
  }

  const rawIsVerified =
    t.isVerified ??
    t.is_verified ??
    t.artisan?.isVerified ??
    t.artisan?.is_verified ??
    null;
  const isVerified = Number(rawIsVerified) === 1 || rawIsVerified === true || rawIsVerified === "1";

  if (!isVerified) {
    return (
      <div className="page-shell container max-w-7xl mx-auto px-4" dir="rtl">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 mt-6 text-amber-800">
          هذا الحرفي قيد التحقق من طرف الإدارة ولا يمكن عرضه حالياً.
        </div>
      </div>
    );
  }

  /* ─────────────── DATA NORMALIZATION ─────────────── */
  const fullName = t.fullName ?? t.full_name ?? "-";
  const avatarUrl = t.avatarUrl ?? t.avatar_url ?? null;
  const city = t.city ?? "-";
  const phone = t.phone ?? null;
  const specialties = Array.isArray(t.specialties) ? t.specialties : [];
  const avg =
    typeof t.averageRating === "number"
      ? t.averageRating
      : Number(t.average_rating ?? 0);
  const isPremium = Boolean(t.isPremium ?? t.is_premium);

  const services = Array.isArray(servicesQ.data) ? servicesQ.data : [];
  const reviews = Array.isArray(reviewsQ.data) ? reviewsQ.data : [];
  const portfolio = Array.isArray(portfolioQ.data) ? portfolioQ.data : [];

  // userId ديال صاحب الحساب المرتبط بالحرفي (باش الدردشة تخدم)
  const peerUserId = t.userId ?? t.user_id ?? t.user?.id ?? null;

  /* ─────────────── HANDLE CHAT ─────────────── */
  const handleStartChat = async () => {
    if (!token) {
      toast.error("المرجو تسجيل الدخول أولاً");
      return;
    }
    if (!peerUserId) {
      toast.error("تعذر فتح الدردشة مع هذا المستخدم");
      return;
    }
    if (user?.id === peerUserId) {
      toast.error("لا يمكنك مراسلة نفسك");
      return;
    }

    try {
      const res = await http.post("/chat/threads", { userId: peerUserId });
      const thread = res.data.thread || res.data?.data?.thread || res.data?.thread;
      if (thread?.id) {
        nav(`/chat/${thread.id}`);
      } else {
        toast.error("تعذر فتح الدردشة");
      }
    } catch (err) {
      // message ديال http interceptor كيوصل للتوست، هنا غير fallback
      console.error(err);
      if (!err?.message) toast.error("تعذر فتح الدردشة");
    }
  };

  /* ─────────────── UI ─────────────── */
  return (
    <div className="page-shell container max-w-7xl mx-auto px-4 space-y-6" dir="rtl">
      {/* Header */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AvatarUpload value={avatarUrl} placeholder={fullName?.[0] || "ح"} />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{fullName}</h1>
              <div className="text-sm text-slate-600">
                {city} • {specialties.join(", ")}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <RatingStars value={avg} />
                <span className="text-xs text-slate-600">
                  {avg ? avg.toFixed(1) : "0.0"}
                </span>
                {isPremium && <span className="text-amber-600 text-xs">★ بريميوم</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && peerUserId && user.id !== peerUserId && (
              <button
                onClick={handleStartChat}
                className="px-3 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                مراسلة
              </button>
            )}

            {phone && (
              <a
                href={`tel:${phone}`}
                className="px-3 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                اتصال
              </a>
            )}

            <Link
              to={`/create-request?technicianId=${t.id}`}
              className="px-3 py-2 rounded-2xl bg-brand-600 text-white hover:bg-brand-700"
            >
              حجز خدمة
            </Link>
          </div>
        </div>
      </section>

      {/* Availability & Price */}
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
          <div className="text-2xl font-bold text-slate-900">
            {t.visitPrice ?? t.visit_price ?? 150} درهم
          </div>
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
                <div className="text-sm text-slate-600">يغطي المدن: {city}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialties.map((s) => (
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
                  {services.map((s) => {
                    const pf = s.priceFrom ?? s.price_from;
                    const pt = s.priceTo ?? s.price_to ?? pf;
                    return (
                      <div key={s.id} className="rounded-xl border p-3">
                        <div className="font-medium text-slate-900">{s.title}</div>
                        {pf ? (
                          <div className="text-sm text-slate-600 mt-1">
                            {pf} - {pt} درهم
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {!servicesQ.isLoading && services.length === 0 && !servicesQ.isError && (
                    <div className="text-sm text-slate-500">لا خدمات معلنة</div>
                  )}
                  {servicesQ.isError && (
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
                {reviews.map((r) => {
                  const date = r.date ?? r.createdAt ?? r.created_at;
                  return (
                    <div key={r.id} className="border rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-900">{r.author ?? "-"}</div>
                        <RatingStars value={r.rating ?? 0} />
                      </div>
                      <div className="text-sm text-slate-700 mt-1">{r.comment ?? "-"}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {date ? new Date(date).toLocaleDateString() : "-"}
                      </div>
                    </div>
                  );
                })}
                {!reviewsQ.isLoading && reviews.length === 0 && !reviewsQ.isError && (
                  <div className="text-sm text-slate-500">لا توجد آراء بعد</div>
                )}
                {reviewsQ.isError && (
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
                  {portfolio.map((img) => (
                    <div
                      key={img.id ?? img.url}
                      className="relative group rounded-xl overflow-hidden border"
                    >
                      <img src={img.url} className="h-40 w-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
                {!portfolioQ.isLoading && portfolio.length === 0 && !portfolioQ.isError && (
                  <div className="text-sm text-slate-500 mt-2">لا توجد صور بعد</div>
                )}
                {portfolioQ.isError && (
                  <div className="text-sm text-red-600 mt-2">تعذر تحميل الصور</div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
