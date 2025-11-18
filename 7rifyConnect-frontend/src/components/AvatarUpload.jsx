
import { useEffect, useState } from "react";

export default function AvatarUpload({ value, onChange, onFileChange, placeholder = "?" }) {
  const [preview, setPreview] = useState(value || "");

  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(url);
    onFileChange?.(file);
  };

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
        تحميل صورة
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              handleFile(f);
            }
          }}
        />
      </label>
    </div>
  );
}
