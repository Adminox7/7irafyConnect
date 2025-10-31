export default function Chip({ children, selected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
        selected ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
