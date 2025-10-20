import { useEffect, useState } from "react";
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
  const user = useAuthStore((s) => s.user);
  const meId = user?.id ?? 2; // fallback to seeded tech id
  const qc = useQueryClient();

  // Queries (ثابتة ديما)
  const meQ = useQuery({
    queryKey: ["tech", "profile", meId],
    queryFn: () => Api.getTechnician(meId),
    enabled: !!meId,
  });

  const servicesQ = useQuery({
    queryKey: ["tech", meId, "services"],
    queryFn: () => Api.getTechnicianServices(meId),
    enabled: !!meId,
  });

  const portfolioQ = useQuery({
    queryKey: ["tech", meId, "portfolio"],
    queryFn: () => Api.getTechnicianPortfolio(meId),
    enabled: !!meId,
  });

  // Mutations
  const upd = useMutation({
    mutationFn: (body) => Api.updateTechnicianProfile(meId, body),
    onSuccess: () => {
      toast.success("تم حفظ التغييرات");
      qc.invalidateQueries({ queryKey: ["tech", "profile", meId] });
    },
    onError: () => toast.error("تعذر الحفظ"),
  });

  const svcCreate = useMutation({
    mutationFn: (body) => Api.createTechnicianService(meId, body),
    onSuccess: () => {
      toast.success("تمت الإضافة");
      qc.invalidateQueries({ queryKey: ["tech", meId, "services"] });
    },
    onError: () => toast.error("تعذر الإضافة"),
  });

  const svcUpdate = useMutation({
    mutationFn: ({ sid, body }) => Api.updateTechnicianService(meId, sid, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["tech", meId, "services"] }),
    onError: () => toast.error("تعذر التعديل"),
  });

  const svcDelete = useMutation({
    mutationFn: (sid) => Api.deleteTechnicianService(meId, sid),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["tech", meId, "services"] });
    },
    onError: () => toast.error("تعذر الحذف"),
  });

  // Form state (دائماً نفس الترتيب)
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  const [svcTitle, setSvcTitle] = useState("");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcPrice, setSvcPrice] = useState("");

  // Sync ملي كتجي data
  useEffect(() => {
    const me = meQ.data;
    if (!me) return;
    setFullName(me.fullName || "");
    setCity(me.city || "");
    setPhone(me.phone || "");
    setBio(me.bio || "");
    setSpecialties(Array.isArray(me.specialties) ? me.specialties : []);
    setIsPremium(!!me.isPremium);
  }, [meQ.data]);

  // Helpers
  const addImage = async (file) => {
    if (!file) return;
    const { url } = await Api.upload(file);
    await Api.addPortfolioImage(meId, { url });
    qc.invalidateQueries({ queryKey: ["tech", meId, "portfolio"] });
  };

  const removeImage = async (imageId) => {
    await Api.deletePortfolioImage(meId, imageId);
    qc.invalidateQueries({ queryKey: ["tech", meId, "portfolio"] });
  };

  const isLoading = meQ.isLoading;
  const me = meQ.data;
  const services = servicesQ.data ?? [];
  const portfolio = portfolioQ.data ?? [];

  if (isLoading) {
    return (
      <div className="page-shell mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="h-28 rounded-2xl border border-slate-200 bg-white animate-pulse mt-6" />
      </div>
    );
  }

  if (meQ.isError || !me) {
    return (
      <div className="page-shell mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 mt-6">
          تعذّر تحميل الملف. جرّب لاحقاً.
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Header */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm mt-4">
        <div className="flex items-center gap-4">
          <AvatarUpload
            value={me?.avatarUrl}
            placeholder={(me?.fullName || "ح").slice(0, 1)}
          />
          <div>
            <div className="text-xl font-semibold text-slate-900">
              {me?.fullName}
            </div>
            <div className="text-sm text-slate-600">{me?.city}</div>
            {me?.isPremium && (
              <div className="text-xs text-amber-600 mt-1">★ بريميوم</div>
            )}
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
                  {(Array.isArray(services) ? services : []).map((s) => (
                    <div key={s.id} className="rounded-xl border p-3">
                      <div className="font-medium text-slate-900">{s.title}</div>
                      {s.priceFrom && (
                        <div className="text-xs text-slate-600 mt-1">
                          {s.priceFrom} - {s.priceTo || s.priceFrom} درهم
                        </div>
                      )}
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="subtle"
                          onClick={() =>
                            svcUpdate.mutate({
                              sid: s.id,
                              body: { title: s.title + " (تعديل)" },
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
                  ))}
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
                  {(Array.isArray(portfolio) ? portfolio : []).map((img) => (
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
                <div className="text-sm text-slate-500">
                  لاحقاً: حذف صورة الملف
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
