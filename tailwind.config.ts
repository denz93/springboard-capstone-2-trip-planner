import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [require('@tailwindcss/typography'), require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {

          "primary": "#eab308",

          "secondary": "#6366f1",

          "accent": "#d97706",

          "neutral": "#374151",

          "base-100": "#1f2937",

          "info": "#f3f4f6",

          "success": "#4ade80",

          "warning": "#fef08a",

          "error": "#f87171",
        },
      }
    ]
  }
};
export default config;
