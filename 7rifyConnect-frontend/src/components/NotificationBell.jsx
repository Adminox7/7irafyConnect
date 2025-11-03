import { Link } from "react-router-dom";
import { useNoticeStore } from "../stores/notifications";
import { useAuthStore } from "../stores/auth";

const iconClasses = "size-5 text-slate-600";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClasses}>
      <path
        fill="currentColor"
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7.45-5A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.55 17c.83-1 1.45-1.85 1.45-5 0-3.68 2.05-6.49 5-7.18V4a1 1 0 1 1 2 0v.82c2.95.69 5 3.5 5 7.18 0 3.13.62 4 .45 5Z"
      />
    </svg>
  );
}

export default function NotificationBell() {
  const role = useAuthStore((s) => s.user?.role);
  const messageTotal = useNoticeStore((s) => s.messageTotal);
  const pendingTechnicians = useNoticeStore((s) => s.pendingTechnicians);

  const total = role === "admin"
    ? messageTotal + pendingTechnicians
    : messageTotal;

  if (!role) return null;

  const badgeNumber = total > 99 ? "99+" : total;
  const hasAlerts = total > 0;
  const goToAdmin = role === "admin" && pendingTechnicians > 0;
  const href = goToAdmin ? "/admin" : "/chat";

  const label = goToAdmin
    ? "إشعارات الإدارة والدردشة"
    : "إشعارات الدردشة";

  return (
    <Link
      to={href}
      className="relative inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
      aria-label={label}
    >
      <BellIcon />
      {hasAlerts && (
        <span className="absolute -top-1 -left-1 min-w-[1.5rem] rounded-full bg-danger-500 px-1.5 py-0.5 text-center text-[11px] font-semibold text-white shadow">
          {badgeNumber}
        </span>
      )}
    </Link>
  );
}

