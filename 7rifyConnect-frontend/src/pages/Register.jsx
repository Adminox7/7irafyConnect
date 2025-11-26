import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import { useAuthStore } from "../stores/auth";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../components/Input";
import Button from "../components/Button";
import TagInput from "../components/TagInput";

export default function Register() {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "technicien" ? "technicien" : "client");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  // Technician-only fields
  const [specialties, setSpecialties] = useState([]);
  const [specialtyDescription, setSpecialtyDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [nationalIdFront, setNationalIdFront] = useState("");
  const [nationalIdFrontFile, setNationalIdFrontFile] = useState(null);
  const [nationalIdBack, setNationalIdBack] = useState("");
  const [nationalIdBackFile, setNationalIdBackFile] = useState(null);

  const loginStore = useAuthStore((s) => s.login);
  const nav = useNavigate();

  const isTech = role === "technicien";

  useEffect(() => {
    setStep(1);
    if (!isTech) {
      setSpecialties([]);
      setSpecialtyDescription("");
      setIsPremium(false);
      setAvatar("");
      setAvatarFile(null);
      setNationalIdFront("");
      setNationalIdFrontFile(null);
      setNationalIdBack("");
      setNationalIdBackFile(null);
    }
  }, [isTech]);

  const handleFilePreview = (file, setPreview, setFile) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFile(file);
  };

  const m = useMutation({
    mutationFn: async (body) => {
      const isRemote = (url) => typeof url === "string" && /^https?:\/\//i.test(url);
      let avatarUrl = isRemote(body.avatar) ? body.avatar : "";
      let frontUrl = isRemote(body.nationalIdFront) ? body.nationalIdFront : "";
      let backUrl = isRemote(body.nationalIdBack) ? body.nationalIdBack : "";
      const description = (body.specialtyDescription || "").trim();

      if (body.avatarFile instanceof File) {
        const uploaded = await Api.upload(body.avatarFile, { skipAuth: true });
        avatarUrl = uploaded?.url || avatarUrl;
      }
      if (body.nationalIdFrontFile instanceof File) {
        const uploaded = await Api.upload(body.nationalIdFrontFile, { skipAuth: true });
        frontUrl = uploaded?.url || frontUrl;
      }
      if (body.nationalIdBackFile instanceof File) {
        const uploaded = await Api.upload(body.nationalIdBackFile, { skipAuth: true });
        backUrl = uploaded?.url || backUrl;
      }

      return Api.register({
        role: body.role,
        name: body.name,
        email: body.email,
        password: body.password,
        city: body.city,
        phone: body.phone,
        specialties: body.specialties,
        specialtyDescription: description,
        bio: description,
        isPremium: body.isPremium,
        avatarUrl,
        nationalIdFrontUrl: frontUrl,
        nationalIdBackUrl: backUrl,
      });
    },
    onSuccess: (res) => {
      loginStore({ user: res.user, token: res.token, role: res.role });
      const tech = res.role === "technicien";
      const isVerified =
        res.user?.technician?.isVerified ??
        res.user?.technician?.is_verified ??
        res.user?.verified ??
        false;
      toast.success(
        tech && !isVerified ? "تم التسجيل، حسابك في انتظار التحقق" : "تم إنشاء الحساب بنجاح"
      );
      if (tech) {
        nav(isVerified ? "/dashboard" : "/pending-verification");
      } else {
        nav("/search");
      }
    },
    onError: (err) => {
      toast.error(err?.message || "تعذر إنشاء الحساب");
    },
  });

  const submit = (e) => {
    e.preventDefault();
    const emailOk = /.+@.+\..+/.test(email);
    const passOk = String(password).length >= 6;
    const phoneOk = /^\d{6,}$/.test(String(phone || "").replace(/\D/g, ""));
    const cityOk = Boolean(city && city.trim().length >= 2);
    if (!name) return toast.error("الاسم الكامل إجباري");
    if (!emailOk) return toast.error("أدخل بريداً إلكترونياً صالحاً");
    if (!passOk) return toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    if (!cityOk) return toast.error("المدينة غير صالحة");
    if (!phoneOk) return toast.error("رقم الهاتف غير صالح");
    if (isTech && step === 1) {
      return setStep(2);
    }
    if (isTech && specialties.length < 1) {
      return toast.error("أضف تخصصاً واحداً على الأقل");
    }
    if (isTech && !specialtyDescription.trim()) {
      return toast.error("أضف وصفاً لتخصصاتك");
    }
    if (isTech && !nationalIdFrontFile && !nationalIdFront) {
      return toast.error("أضف صورة بطاقة التعريف - الوجه الأمامي");
    }
    if (isTech && !nationalIdBackFile && !nationalIdBack) {
      return toast.error("أضف صورة بطاقة التعريف - الوجه الخلفي");
    }
    if (isTech && !avatarFile && !avatar) {
      return toast.error("أضف صورة للملف الشخصي");
    }

    m.mutate({
      role,
      name,
      email,
      password,
      city,
      phone,
      specialties,
      specialtyDescription,
      isPremium,
      avatar,
      avatarFile,
      nationalIdFront,
      nationalIdFrontFile,
      nationalIdBack,
      nationalIdBackFile,
    });
  };

  return (
    <div className="page-shell mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" dir="rtl">
        <h1 className="text-xl font-semibold mb-4 text-slate-900">حساب جديد</h1>
        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-3">
            <label className={`px-3 py-2 rounded-2xl border cursor-pointer transition-colors ${role === "client" ? "bg-black text-white border-brand-600" : "hover:bg-slate-50"}`}>
              <input
                type="radio"
                name="role"
                value="client"
                className="hidden"
                checked={role === "client"}
                onChange={() => setRole("client")}
              />
              زبون
            </label>
            <label className={`px-3 py-2 rounded-2xl border cursor-pointer transition-colors ${role === "technicien" ? "bg-black text-white border-brand-600" : "hover:bg-slate-50"}`}>
              <input
                type="radio"
                name="role"
                value="technicien"
                className="hidden"
                checked={role === "technicien"}
                onChange={() => setRole("technicien")}
              />
              حرفي
            </label>
          </div>

          {isTech && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step === 1 ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-700"}`}>
                1
              </span>
              <span>البيانات العامة</span>
              <span className="border-t border-slate-200 flex-1" />
              <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step === 2 ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-700"}`}>
                2
              </span>
              <span>الوثائق والصور</span>
            </div>
          )}

          {(!isTech || step === 1) && (
            <div className="space-y-3">
              <Input placeholder="الاسم الكامل" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Input placeholder="المدينة" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input placeholder="الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}

          {isTech && step === 2 && (
            <div className="space-y-4">
              <TagInput
                value={specialties}
                onChange={setSpecialties}
                placeholder="أضف تخصصاً واضغط Enter"
              />
              <label className="text-sm">
                <div className="text-slate-600 mb-1">وصف التخصصات</div>
                <textarea
                  className="w-full rounded-2xl border border-slate-300 p-2"
                  rows={3}
                  placeholder="اكتب نبذة قصيرة عن خبراتك وتخصصاتك"
                  value={specialtyDescription}
                  onChange={(e) => setSpecialtyDescription(e.target.value)}
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-300 cursor-pointer p-3 flex flex-col items-center justify-center text-sm text-slate-600 bg-slate-50/50">
                  {avatar || avatarFile ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <img src={avatar} className="h-28 w-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center">
                      <div className="font-semibold mb-1">صورة الملف الشخصي</div>
                      <div className="text-xs text-slate-500">png أو jpg</div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFilePreview(file, setAvatar, setAvatarFile);
                    }}
                  />
                </label>
                <label className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-300 cursor-pointer p-3 flex flex-col items-center justify-center text-sm text-slate-600 bg-slate-50/50">
                  {nationalIdFront || nationalIdFrontFile ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <img src={nationalIdFront} className="h-28 w-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center">
                      <div className="font-semibold mb-1">بطاقة وطنية (أمامي)</div>
                      <div className="text-xs text-slate-500">صورة واضحة</div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFilePreview(file, setNationalIdFront, setNationalIdFrontFile);
                    }}
                  />
                </label>
                <label className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-300 cursor-pointer p-3 flex flex-col items-center justify-center text-sm text-slate-600 bg-slate-50/50">
                  {nationalIdBack || nationalIdBackFile ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <img src={nationalIdBack} className="h-28 w-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center">
                      <div className="font-semibold mb-1">بطاقة وطنية (خلفي)</div>
                      <div className="text-xs text-slate-500">صورة واضحة</div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFilePreview(file, setNationalIdBack, setNationalIdBackFile);
                    }}
                  />
                </label>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                />
                حرفي مميز (Premium)
              </label>
            </div>
          )}

          <div className="flex items-center gap-3 justify-between">
            {isTech && step === 2 && (
              <Button type="button" variant="subtle" onClick={() => setStep(1)} disabled={m.isPending}>
                رجوع
              </Button>
            )}
            <Button type="submit" disabled={m.isPending} className="flex-1">
              {m.isPending ? "جارٍ المتابعة…" : isTech && step === 1 ? "التالي" : "إنشاء الحساب"}
            </Button>
          </div>

          {m.isError && (
            <div className="text-red-600 text-sm">تعذر إنشاء الحساب. تأكد من الحقول.</div>
          )}
        </form>
        <div className="mt-3 text-sm text-slate-600 text-right">
          عندك حساب؟{" "}
          <Link to="/login" className="text-brand-700 hover:text-brand-800 underline">
            دخول
          </Link>
        </div>
      </div>
    </div>
  );
}
