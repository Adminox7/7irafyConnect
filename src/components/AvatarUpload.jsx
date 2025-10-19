import { useState } from "react";

export default function AvatarUpload({ value, onChange, placeholder = "ص" }) {
  const [preview, setPreview] = useState(value || "");
  return (
    <div className="flex items-center gap-4">
      <div className="h-24 w-24 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xl font-semibold text-slate-600">
        {preview ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={preview} className="h-full w-full object-cover" />
        ) : (
          placeholder
        )}
      </div>
      <label className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer">
        رفع صورة
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              const url = URL.createObjectURL(f);
              setPreview(url);
              onChange?.(url);
            }
          }}
        />
      </label>
    </div>
  );
}
