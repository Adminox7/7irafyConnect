import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import { useAuthStore } from "../stores/auth";
import Tabs from "../components/Tabs";
import AvatarUpload from "../components/AvatarUpload";
import TagInput from "../components/TagInput";
import Button from "../components/Button";
import Input from "../components/Input";
import toast from "react-hot-toast";

export default function TechSelfProfile() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // technicianId يُفضَّل يجي من الـuser (مثلاً ارسلناه من /auth/me)
  const technicianId = useMemo(
    () => user?.technicianId ?? user?.technician_id ?? null,
    [user]
  );

  /* ────────────────────────────── QUERIES ────────────────────────────── */
  // بروفايل عام للحرفي (للـعرض فقط) — نحتاج technicianId
  const techQ = useQuery({
    queryKey: ["tech", "public", technicianId],
    queryFn: () => Api.getTechnician(technicianId),
    enabled: !!technicianId,
  });

  // خدماتي (لا يوجد GET /tech/me/services في الراوتر، لذا نجيبها عبر /technicians/:id/services)
  const servicesQ = useQuery({
    queryKey: ["tech", technicianId, "services"],
    queryFn: () => Api.getTechnicianServices(technicianId),
    enabled: !!technicianId,
  });

  // معرض الأعمال الذاتي عبر /tech/me/portfolio (ما كيتطلبش id)
  const portfolioQ = useQuery({
    queryKey: ["tech", "me", "portfolio"],
    queryFn: () => Api.getMyPortfolio(),
  });

  /* ──────────────────────────── MUTATIONS ───────────────────────────── */
  // تحديث بروفايلي الذاتي عبر /tech/me
  const upd = useMutation({
    mutationFn: async (body) => {
      let avatarUrl = body.avatar ?? null;
      if (body.avatarFile instanceof File) {
        const uploaded = await Api.upload(body.avatarFile);
        avatarUrl = uploaded?.url ?? avatarUrl;
      }
      await Api.updateProfile({
        fullName: body.fullName,
        city: body.city,
        phone: body.phone,
        avatarUrl,
      });
      return Api.updateMyTechProfile({
        fullName: body.fullName,
        city: body.city,
        phone: body.phone,
        bio: body.bio,
        specialties: body.specialties ?? [],
        isPremium: body.isPremium,
        avatarUrl,
      });
    },
    onSuccess: (res) => {
      toast.success("تم حفظ ملفك الشخصي");
      qc.invalidateQueries({ queryKey: ["tech", "public", technicianId] });
      qc.invalidateQueries({ queryKey: ["top-techs"] });
      qc.invalidateQueries({ queryKey: ["technicians"] });
      if (res?.user) {
        setUser(res.user);
      }
      if (res?.technician?.avatarUrl) {
        setAvatar(res.technician.avatarUrl);
      }
      setAvatarFile(null);
    },
    onError: () => toast.error("?حرفي مميز?"),
  });

  // الخدمات الذاتيّة عبر /tech/me/services
  const svcCreate = useMutation({
    mutationFn: (b) =>
      Api.createMyService({
        title: b.title,
        shortDesc: b.shortDesc,
        priceFrom: b.priceFrom,
        priceTo: b.priceTo,
      }),
    onSuccess: () => {
      toast.success("تمت الإضافة");
      qc.invalidateQueries({ queryKey: ["tech", technicianId, "services"] });
    },
    onError: () => toast.error("تعذّر الإضافة"),
  });

  const svcUpdate = useMutation({
    mutationFn: ({ sid, body }) => Api.updateMyService(sid, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tech", technicianId, "services"] });
      toast.success("تم التعديل");
    },
    onError: () => toast.error("تعذّر التعديل"),
  });

  const svcDelete = useMutation({
    mutationFn: (sid) => Api.deleteMyService(sid),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["tech", technicianId, "services"] });
    },
    onError: () => toast.error("تعذّر الحذف"),
  });

  // معرض الأعمال الذاتي عبر /tech/me/portfolio
  const addImage = async (file) => {
    if (!file) return;
    const { url } = await Api.upload(file);
    await Api.uploadToMyPortfolio({ url });
    qc.invalidateQueries({ queryKey: ["tech", "me", "portfolio"] });
  };

  const removeImage = async (imageId) => {
    await Api.deleteFromMyPortfolio(imageId);
    qc.invalidateQueries({ queryKey: ["tech", "me", "portfolio"] });
  };

  /* ─────────────────────────── FORM STATE ───────────────────────────── */
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  const [svcTitle, setSvcTitle] = useState("");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcPrice, setSvcPrice] = useState("");

  // لما توصل بيانات العامّة ديال الحرفي (أو من user) كيتمّ المزامنة
  useEffect(() => {
    const me = techQ.data;
    if (me) {
      setFullName(me.fullName ?? me.full_name ?? user?.fullName ?? "");
      setCity(me.city ?? user?.city ?? "");
      setPhone(me.phone ?? user?.phone ?? "");
      setBio(me.bio ?? "");
      setSpecialties(Array.isArray(me.specialties) ? me.specialties : []);
      setIsPremium(Boolean(me.isPremium ?? me.is_premium));
      setAvatar(me.avatarUrl ?? me.avatar_url ?? user?.avatarUrl ?? "");
      setAvatarFile(null);
    } else if (user) {
      setFullName(user.fullName ?? user.full_name ?? "");
      setCity(user.city ?? "");
      setPhone(user.phone ?? "");
      setAvatar(user.avatarUrl ?? user.avatar_url ?? "");
      setAvatarFile(null);
    }
  }, [techQ.data, user]);

  const isLoading = techQ.isLoading && !!technicianId;
  const me = techQ.data;
  const services = Array.isArray(servicesQ.data) ? servicesQ.data : [];
  const portfolio = Array.isArray(portfolioQ.data) ? portfolioQ.data : [];

  /* ────────────────────────── RENDER STATES ─────────────────────────── */
  if (!technicianId) {
    return (
      <div className="page-shell mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-700 mt-6" dir="rtl">
          حسابك غير مربوط ببطاقة حرفي بعد. تواصل مع الإدارة لربط الحساب.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-shell mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="h-28 rounded-2xl border border-slate-200 bg-white animate-pulse mt-6" />
      </div>
    );
  }

  if (techQ.isError) {
    return (
      <div className="page-shell mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 mt-6" dir="rtl">
          تعذّر تحميل الملف. جرّب لاحقاً.
        </div>
      </div>
    );
  }

  /* ─────────────────────────────── UI ──────────────────────────────── */
  return (
    <div className="page-shell mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Header */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm mt-4">
        <div className="flex items-center gap-4">
          <AvatarUpload
            value={avatar}
            onChange={setAvatar}
            onFileChange={setAvatarFile}
            placeholder={(fullName || me?.fullName || me?.full_name || "?").slice(0, 1)}
          />
          <div>
            <div className="text-xl font-semibold text-slate-900">{fullName}</div>
            <div className="text-sm text-slate-600">{city}</div>
            {(isPremium || me?.isPremium || me?.is_premium) ? (
              <div className="text-xs text-amber-600 mt-1">حرفي مميز</div>
            ) : null}
          </div>
        </div>
      </section>

      <Tabs
        initial={0}
        tabs={[
          {
            key: "edit",
            label: "الملف",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
                <Input
                  placeholder="الإسم الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="المدينة"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    placeholder="الهاتف"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <TagInput value={specialties} onChange={setSpecialties} />
                <label className="text-sm">
                  <div className="text-slate-600 mb-1">نبذة</div>
                  <textarea
                    className="w-full rounded-2xl border border-slate-300 p-2"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                  />
                  حرفي مميّز (Premium)
                </label>
                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      upd.mutate({
                        fullName,
                        city,
                        phone,
                        bio,
                        specialties,
                        isPremium,
                      })
                    }
                    disabled={upd.isPending}
                  >
                    {upd.isPending ? "جارٍ الحفظ…" : "حفظ التغييرات"}
                  </Button>
                </div>
              </div>
            ),
          },
          {
            key: "services",
            label: "خدماتي",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {services.map((s) => {
                    const priceFrom = s.priceFrom ?? s.price_from;
                    const priceTo = s.priceTo ?? s.price_to ?? priceFrom;
                    return (
                      <div key={s.id} className="rounded-xl border p-3">
                        <div className="font-medium text-slate-900">{s.title}</div>
                        {priceFrom ? (
                          <div className="text-xs text-slate-600 mt-1">
                            {priceFrom} - {priceTo} درهم
                          </div>
                        ) : null}
                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="subtle"
                            onClick={() =>
                              svcUpdate.mutate({
                                sid: s.id,
                                body: { title: `${s.title} (تعديل)` },
                              })
                            }
                          >
                            تعديل
                          </Button>
                          <Button
                            variant="subtle"
                            onClick={() => svcDelete.mutate(s.id)}
                          >
                            حذف
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-3">
                  <div className="text-sm text-slate-700 mb-2">إضافة خدمة</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="اسم الخدمة"
                      value={svcTitle}
                      onChange={(e) => setSvcTitle(e.target.value)}
                    />
                    <Input
                      placeholder="سعر تقريبي"
                      value={svcPrice}
                      onChange={(e) => setSvcPrice(e.target.value)}
                    />
                    <Input
                      placeholder="وصف قصير"
                      value={svcDesc}
                      onChange={(e) => setSvcDesc(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={() =>
                        svcCreate.mutate({
                          title: svcTitle,
                          priceFrom: Number(svcPrice) || undefined,
                          shortDesc: svcDesc,
                        })
                      }
                      disabled={svcCreate.isPending}
                    >
                      حفظ
                    </Button>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "portfolio",
            label: "معرض الأعمال",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {portfolio.map((img) => (
                    <div
                      key={img.id}
                      className="relative group rounded-xl overflow-hidden border"
                    >
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img src={img.url} className="h-40 w-full object-cover" />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-white bg-black/50 rounded-full p-1"
                        aria-label="حذف"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <label className="h-40 border rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50">
                    + رفع صور
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((f) => addImage(f));
                      }}
                    />
                  </label>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  الصور للتجربة أثناء التطوير
                </div>
              </div>
            ),
          },
          {
            key: "settings",
            label: "الإعدادات",
            content: (
              <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-2">
                <div className="text-sm text-slate-700">
                  تعديل المدينة والهاتف من تبويب الملف.
                </div>
                <div className="text-sm text-slate-500">لاحقاً: حذف صورة الملف</div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}







