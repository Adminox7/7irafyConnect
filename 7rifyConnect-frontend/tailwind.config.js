/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1200px" } },
    extend: {
      colors: {
        brand: {
          50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",
          400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",
          800:"#075985",900:"#0c4a6e", DEFAULT:"#0ea5e9",
        },
        accent: {
          50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",
          400:"#34d399",500:"#10b981",600:"#22c55e",700:"#16a34a",
          800:"#15803d",900:"#166534", DEFAULT:"#22c55e",
        },
        warning: {
          50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",
          400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",
          800:"#92400e",900:"#78350f", DEFAULT:"#f59e0b",
        },
        danger: {
          50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",
          400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",
          800:"#9f1239",900:"#881337", DEFAULT:"#f43f5e",
        },
      },
      borderRadius: { DEFAULT:"1rem", xl:"1.25rem", "2xl":"1.5rem", "3xl":"1.75rem" },
      boxShadow: {
        sm:"0 1px 2px rgba(0,0,0,.05)",
        md:"0 4px 6px rgba(0,0,0,.08)",
        lg:"0 8px 16px rgba(0,0,0,.10)",
        soft:"0 12px 28px rgba(2,132,199,.10)",
        inner:"inset 0 2px 4px rgba(0,0,0,.06)",
      },
    },
  },
  plugins: [],
};
