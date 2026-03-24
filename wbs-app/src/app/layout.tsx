import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WBS & Gantt - Team Project Manager",
  description: "Lightweight WBS and Gantt chart management app for teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
