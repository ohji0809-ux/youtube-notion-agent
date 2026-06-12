import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backdropBlur: { xs: "2px" },
      colors: {
        glass: "rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
