import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "كتاب قصتنا — Our Story Book",
  description: "مساحة خاصة لشخصين لتوثيق قصتهما المشتركة وحفظ أجمل الذكريات في كتاب رقمي دافئ",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2D2321] antialiased selection:bg-[#F2DDD9] selection:text-[#6B2D38]">
        {children}
      </body>
    </html>
  );
}
