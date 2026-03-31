import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorLens — AI Creator Intelligence for Commerce",
  description: "Find the perfect creator for any product. AI-powered matching with brand affinity, price alignment, and video evidence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen noise">{children}</body>
    </html>
  );
}
