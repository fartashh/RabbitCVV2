import type { Metadata } from "next";
import "./globals.css";

// Using the system font stack for now instead of next/font/google — no
// external font fetch at build time, and we'll bring in real brand
// typography as part of the design system work in packages/ui.

export const metadata: Metadata = {
  title: "RabbitCV — Build resumes that adapt to every job",
  description:
    "Create multiple tailored versions of your resume in minutes. Clone, tailor, export a clean PDF — no starting from scratch.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
