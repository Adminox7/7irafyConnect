export default function Button({ children, className = "", variant = "primary", disabled, ...props }) {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-2xl text-sm font-semibold transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-300",
    outline: "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 focus-visible:ring-brand-300",
    subtle: "bg-white border border-slate-200 text-slate-700 hover:shadow-md focus-visible:ring-brand-300",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
