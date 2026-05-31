import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";
import { AppProviders } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Smart Task Management",
  description:
    "ระบบจัดการงานอัจฉริยะ — Firebase Auth, Firestore Real-time และ AI-assisted workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning className={`${inter.variable} dark h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AppProviders>
          <PwaRegister />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
