import { useMemo, useRef, useState } from "react";
import Chip from "./Chip";

export default function TagInput({
  value = [],
  onChange,
  placeholder = "أضف تخصصاً واضغط Enter",
  options = ["كهربائي", "سبّاك", "نجّار", "صبّاغ", "حدّاد", "ألمنيوم"],
  disabled = false,
  className = "",
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const filteredOptions = useMemo(() => {
    const lower = input.trim().toLowerCase();
    const existing = new Set((value || []).map((t) => String(t).toLowerCase()));
    return (options || [])
      .filter((opt) => !existing.has(String(opt).toLowerCase()))
      .filter((opt) => (lower ? String(opt).toLowerCase().includes(lower) : true))
      .slice(0, 6);
  }, [options, value, input]);

  function addTag(tag) {
    const t = String(tag || input).trim();
    if (!t) return;
    const exists = (value || []).some((v) => String(v).toLowerCase() === t.toLowerCase());
    if (exists) {
      setInput("");
      return;
    }
    const next = [...(value || []), t];
    onChange?.(next);
    setInput("");
    inputRef.current?.focus();
  }

  function removeTag(idx) {
    const next = (value || []).filter((_, i) => i !== idx);
    onChange?.(next);
  }

  return (
    <div className={`w-full text-right ${className}`}>
      <label className="block text-sm text-slate-600 mb-1">التخصصات</label>
      <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-300">
        <div className="flex flex-wrap gap-2">
          {(value || []).map((t, i) => (
            <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-full border border-brand-300 bg-brand-50 text-brand-700 px-3 py-1 text-sm">
              {t}
              <button
                type="button"
                onClick={() => removeTag(i)}
                aria-label={`حذف ${t}`}
                className="ms-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-brand-300 text-brand-700 hover:bg-brand-100"
              >
                ×
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
              if ((e.key === "Backspace" || e.key === "Delete") && !input && (value || []).length > 0) {
                removeTag((value || []).length - 1);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="min-w-[10ch] flex-1 bg-transparent focus:outline-none text-sm placeholder-slate-400"
            aria-label="إضافة تخصص"
            dir="rtl"
          />
        </div>
      </div>

      {filteredOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filteredOptions.map((opt) => (
            <Chip key={opt} onClick={() => addTag(opt)}>{opt}</Chip>
          ))}
        </div>
      )}
    </div>
  );
}
