import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const label = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ladda: Pick right. Learn real. Get hired.",
  description:
    "Find your path, build real projects, and earn credentials employers can check in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${body.variable} ${label.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}