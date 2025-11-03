import { useState } from "react";
import { useNotificationStore } from "../stores/notifications";

export default function NotificationBell() {
  const { totalUnread, adminPendingCount, inbox } = useNotificationStore((state) => state);
  const [open, setOpen] = useState(false);
  const count = (totalUnread || 0) + (adminPendingCount || 0);

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-full border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="الإشعارات"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 2a6 6 0 00-6 6v2.268c0 .495-.184.974-.513 1.342L4.37 13.04A1 1 0 005.124 15h13.752a1 1 0 00.755-1.96l-1.115-.674a1.823 1.823 0 01-.513-1.342V8a6 6 0 00-6-6z" />
          <path d="M10 18a2 2 0 104 0h-4z" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -left-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 z-40 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-right shadow-lg">
          <div className="mb-2 text-sm font-medium text-slate-800">آخر الإشعارات</div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {count === 0 && (
              <div className="text-xs text-slate-500">لا توجد إشعارات جديدة</div>
            )}
            {adminPendingCount > 0 && (
              <div className="rounded-xl bg-amber-50 p-2 text-xs text-amber-800">
                لديك {adminPendingCount} حرفي بانتظار التحقق
              </div>
            )}
            {inbox.slice(0, 10).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-2 text-xs text-slate-700">
                <div className="font-medium text-slate-900">{item.title}</div>
                <div>{item.body}</div>
                {item.createdAt && (
                  <div className="text-[10px] text-slate-500 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
