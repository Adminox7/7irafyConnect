export default function Card({ className = "", children }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white text-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {children}
    </div>
  );
}
