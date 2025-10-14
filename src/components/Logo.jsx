import { motion } from "framer-motion";

export default function Logo({ className = "", withText = true }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} dir="rtl">
      <motion.svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-brand-600"
        aria-hidden="true"
        initial={false}
        animate={{ rotate: 0 }}
      >
        {/* wrench + lightning hybrid */}
        <path d="M14 3l-3 5h3l-2 5 6-7h-3l2-3z" fill="currentColor" />
        <path d="M7 7a3 3 0 104.243 4.243L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
      </motion.svg>
      {withText && (
        <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
          7irafyConnect
        </span>
      )}
    </div>
  );
}
