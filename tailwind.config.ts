import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: "#AECBEB",
        sage: "#C5D6C8",
        pink: "#F5CDD3",
        lavender: "#E0CBE8",
        cream: "#F5DBA8",
        peach: "#F7D2BE",
        navy: "#1B2A4A",
        ink: "#2D3142",
        mist: "#EAF2FB",
        offwhite: "#FBFCFE",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "18px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        sm: "0 2px 10px rgba(27, 42, 74, 0.05)",
        md: "0 10px 30px rgba(27, 42, 74, 0.07)",
        lg: "0 20px 50px rgba(27, 42, 74, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
