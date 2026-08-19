import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#20201d",
        paper: "#f7f5ef",
        line: "#ded9cc",
        sage: "#6f7d68",
        clay: "#9c6f56"
      }
    }
  },
  plugins: []
};

export default config;
