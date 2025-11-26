/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1200px" } },
    extend: {
      colors: {
        brand: {
          50:"#f3f5fb",100:"#e6ebf6",200:"#cdd6e9",300:"#aab9d5",
          400:"#7d91bd",500:"#556fa6",600:"#3a517f",700:"#1c305e",
          800:"#152646",900:"#0f1d37", DEFAULT:"#3a517f",
        },
        accent: {
          50:"#f8fbef",100:"#f1f7df",200:"#e2efbe",300:"#d4e69e",
          400:"#c1da77",500:"#b7d65d",600:"#9cb64f",700:"#809641",
          800:"#657633",900:"#495625", DEFAULT:"#b7d65d",
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
