import { motion } from "framer-motion";

const logoVariants = {
  primary: "/logo.png",
  light: "/logo-wite.png",
};

export default function Logo({
  className = "",
  withText = false,
  variant = "primary",
  size = "lg",
}) {
  const logoSrc = logoVariants[variant] ?? logoVariants.primary;
  const isLight = variant === "light";

  const sizeClasses =
    size === "xl"
      ? "h-30 w-30"
      : size === "sm"
        ? "h-10 w-10"
        : "h-14 w-14 sm:h-19 sm:w-24"; // default lg

  return (
    <div className={`flex items-center gap-2 ${className}`} dir="rtl">
      <motion.img
        src={logoSrc}
        alt="شعار 7irafyConnect"
        className={`${sizeClasses} object-contain drop-shadow-sm`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        loading="lazy"
      />
      {withText && (
        <span className={`text-base sm:text-lg font-extrabold tracking-tight ${isLight ? "text-white" : "text-slate-900"}`}>
          7irafyConnect
        </span>
      )}
    </div>
  );
}
