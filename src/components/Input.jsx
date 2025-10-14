export default function Input({ className = "", ...props }) {
  const base = "border rounded-2xl px-3 py-2 w-full text-right placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30";
  return <input className={`${base} ${className}`} {...props} />;
}
