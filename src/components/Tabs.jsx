import { useState } from "react";

export default function Tabs({ tabs, initial = 0 }) {
  const [idx, setIdx] = useState(initial);
  const Current = tabs[idx]?.content || null;
  return (
    <div>
      <div role="tablist" className="flex items-center gap-2 border-b border-slate-200">
        {tabs.map((t, i) => (
          <button
            role="tab"
            aria-selected={idx === i}
            key={t.key || t.label}
            onClick={() => setIdx(i)}
            className={`px-3 py-2 text-sm -mb-px border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
              idx === i ? "border-brand-600 text-slate-900" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {Current}
      </div>
    </div>
  );
}
