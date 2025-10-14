export default function Button({ children, className = "", variant = "primary", disabled, ...props }) {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-2xl text-sm font-medium transition shadow-sm hover:shadow-md focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-700",
    outline: "border border-slate-300 text-slate-700 hover:bg-brand-50",
    subtle: "bg-white border border-slate-200 text-slate-800 hover:shadow-md",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
