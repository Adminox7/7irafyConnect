import { Link } from "react-router-dom";
import Logo from "./Logo";

const contactItems = [
  {
    label: "البريد",
    value: "support@7rifyconnect.ma",
    href: "mailto:support@7rifyconnect.ma",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7l9 6 9-6M5 18h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z"
        />
      </svg>
    ),
  },
  {
    label: "المقر",
    value: "زنقة التقنية 12، الدار البيضاء - المغرب",
    href: "https://maps.google.com/?q=Casablanca",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 12a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Zm0 0c-4 0-6.5 2-6.5 4v1.75A1.25 1.25 0 0 0 6.75 19h10.5a1.25 1.25 0 0 0 1.25-1.25V16c0-2-2.5-4-6.5-4Z"
        />
      </svg>
    ),
  },
  {
    label: "الهاتف",
    value: "+212 6 00 11 22 33",
    href: "tel:+212600112233",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 4.75v2.5a1.5 1.5 0 0 0 1.28 1.48c.84.14 1.54.53 2.07 1.06l1.13 1.13a16.5 16.5 0 0 0 4.83 4.83l1.13 1.13c.53.53.92 1.23 1.06 2.07a1.5 1.5 0 0 0 1.48 1.28h2.5A1.5 1.5 0 0 0 21.5 18V16a2.5 2.5 0 0 0-2.5-2.5h-.32a3 3 0 0 1-2.82-1.93l-.45-1.21A3 3 0 0 0 12.68 8l-1.21-.45A3 3 0 0 1 9.54 4.73V4.5A2.5 2.5 0 0 0 7.04 2H5.5A1.5 1.5 0 0 0 4 3.5Z"
        />
      </svg>
    ),
  },
];

const serviceLinks = [
  { label: "الكهرباء والتجهيزات", to: "/search?category=electrical" },
  { label: "السباكة والصرف", to: "/search?category=plumbing" },
  { label: "التدفئة والتبريد", to: "/search?category=hvac" },
  { label: "الصيانة السريعة", to: "/search?category=express" },
];

const supportLinks = [
  { label: "أسئلة متكررة", to: "/help/faq" },
  { label: "انضم كحرفي", to: "/register?role=technicien" },
  { label: "سياسة الجودة", to: "/policies/quality" },
  { label: "مركز المساعدة", to: "/help" },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
];

const iconPaths = {
  facebook: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 8.5h1.5V7a2 2 0 0 1 2-2H15v3h-1.5V11H15l-.5 3h-2v6H9v-6H7V11h2V8.5Z"
    />
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" ry="5" />
      <path d="M15.5 12A3.5 3.5 0 1 1 12 8.5 3.5 3.5 0 0 1 15.5 12Z" />
      <circle cx="17.5" cy="6.5" r="1" />
    </>
  ),
  linkedin: (
    <>
      <path d="M6.75 9.75h2.5v8.5h-2.5zM7.98 6.25a1.5 1.5 0 1 1-1.49 1.5 1.5 1.5 0 0 1 1.49-1.5Z" />
      <path d="M11.5 9.75h2.39v1.16c.35-.7 1.23-1.33 2.51-1.33 2.2 0 3.1 1.15 3.1 3.56v5.11h-2.5v-4.52c0-1.29-.39-1.95-1.35-1.95-1.32 0-1.89.86-1.89 2.24v4.23h-2.26Z" />
    </>
  ),
  youtube: (
    <>
      <path d="M4.5 8.25c0-.966.784-1.75 1.75-1.75h11.5c.966 0 1.75.784 1.75 1.75v7.5c0 .966-.784 1.75-1.75 1.75H6.25c-.966 0-1.75-.784-1.75-1.75Z" />
      <path d="m11 10.5 3.75 2.5L11 15.5Z" />
    </>
  ),
};

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-100" dir="rtl">
      <div className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.3fr,1fr,1fr,1.2fr]">
            <div className="space-y-5">
              <Logo className="text-white" />
              <p className="text-sm leading-relaxed text-slate-300">
                7rify Connect منصة مغربية تربط الأسر والشركات بأفضل الحرفيين المعتمدين. نضمن لك تجربة
                حجز بالعربية، مواعيد واضحة، وتقارير صيانة رقمية لحرفييك المفضلين.
              </p>
              <div className="flex flex-wrap gap-3 text-slate-200">
                {socialLinks.map((item) => (
                  <a
                    key={item.icon}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-50 transition hover:bg-brand-500 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                      {iconPaths[item.icon]}
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-lg font-semibold text-white">تواصل معنا</p>
                <div className="mt-2 h-1 w-12 rounded-full bg-brand-400" />
              </div>
              <ul className="space-y-4">
                {contactItems.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-sm text-slate-300"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500/15 text-brand-200">
                      {item.icon}
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <a href={item.href} className="block text-base font-semibold text-slate-100 transition hover:text-brand-300">
                        {item.value}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <div>
                <div>
                  <p className="text-lg font-semibold text-white">خدمات متخصصة</p>
                  <div className="mt-2 h-1 w-12 rounded-full bg-brand-400" />
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {serviceLinks.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="flex items-center gap-2 transition hover:text-brand-300">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                        </svg>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div>
                  <p className="text-lg font-semibold text-white">الدعم والشراكات</p>
                  <div className="mt-2 h-1 w-12 rounded-full bg-brand-400" />
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {supportLinks.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="flex items-center gap-2 transition hover:text-brand-300">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                        </svg>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl bg-white/5 p-6 shadow-[0_15px_60px_rgba(15,23,42,0.35)]">
              <div>
                <p className="text-lg font-semibold text-white">نشرة الزبناء والشركاء</p>
                <div className="mt-2 h-1 w-12 rounded-full bg-brand-400" />
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                توصلك أحدث فرص الصيانة والعروض الخاصة مرتين كل شهر، باللغة العربية وبأسلوب يلائم احتياجاتك.
              </p>
              <form className="space-y-3">
                <label className="sr-only" htmlFor="footer-email">
                  البريد الإلكتروني
                </label>
                <div className="flex items-center rounded-full bg-slate-900/70 p-1 pr-3 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-brand-300">
                  <input
                    id="footer-email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
                  >
                    <span>اشترك</span>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75 19.5 5.25l-4.5 14.5-2.5-5-5-2.5Z"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  بالاشتراك، توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بـ 7rify Connect.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} 7rify Connect. جميع الحقوق محفوظة.</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/terms" className="transition hover:text-brand-300">
            شروط الاستخدام
          </Link>
          <Link to="/privacy" className="transition hover:text-brand-300">
            سياسة الخصوصية
          </Link>
          <Link to="/cookies" className="transition hover:text-brand-300">
            سياسة ملفات تعريف الارتباط
          </Link>
        </div>
      </div>
    </footer>
  );
}

