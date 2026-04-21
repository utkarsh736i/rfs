import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReflexSense — The Nervous System of Industry",
  description: "Detect failures early and act faster with affordable predictive maintenance. Convert avoided downtime into output.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
