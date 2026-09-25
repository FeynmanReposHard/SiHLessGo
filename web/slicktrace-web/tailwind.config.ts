import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#F7F6F2",
        surfaceRaised: "#FFFFFF",
        ink: "#15171A",
        inkMuted: "#5B5F66",
        inkFaint: "#8B8E94",
        line: "#DEDCD4",
        lineStrong: "#C7C4B8",
        // Domain semantics
        slick: "#2B5D8C", // marine blue — observed slick / current state
        slickSoft: "#DCE7F0",
        origin: "#B5722A", // muted amber/orange — historical origin
        originSoft: "#F2E3D0",
        forecast: "#9FC3DE", // pale translucent blue — future drift
        forecastSoft: "#E7F1F8",
        ais: "#9B9C94", // grey AIS tracks
        aisDim: "#D2D1C8",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["Source Serif 4", "Georgia", "Times New Roman", "serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "7px",
        md: "8px",
      },
      boxShadow: {
        control: "0 1px 3px rgba(21,23,26,0.14)",
        panel: "0 0 0 1px rgba(21,23,26,0.05), 0 4px 16px rgba(21,23,26,0.08)",
      },
      fontSize: {
        micro: ["11px", { lineHeight: "14px", letterSpacing: "0.01em" }],
      },
    },
  },
  plugins: [],
};

export default config;
