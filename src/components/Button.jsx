export default function Button({ children, className = "", variant = "primary", disabled, ...props }) {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-700",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    subtle: "bg-slate-100 text-slate-800 hover:bg-slate-200",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
