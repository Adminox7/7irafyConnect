export default function Input({ className = "", ...props }) {
  const base = [
    "w-full text-right",
    "rounded-2xl border border-slate-300 bg-white text-slate-800",
    "px-4 py-2.5 placeholder-slate-400",
    "shadow-sm",
    "transition-colors duration-200",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:border-brand-300",
  ].join(" ");
  return <input className={`${base} ${className}`} {...props} />;
}
