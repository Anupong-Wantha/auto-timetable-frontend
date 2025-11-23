import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ปรับแก้ส่วน Metadata ตรงนี้
export const metadata: Metadata = {
  // ชื่อเว็บที่แสดงบน Tab Browser
  title: "SmartScheduler AI - ระบบจัดตารางสอนอัตโนมัติ",
  // คำอธิบายสั้นๆ (ช่วยเรื่อง SEO และดูโปรตอนส่งงาน)
  description: "ระบบจัดตารางสอนอัตโนมัติด้วย AI (Genetic Algorithm) สำหรับการแข่งขันทักษะวิชาชีพ",
  // การตั้งค่าไอคอน (Favicon)
  icons: {
    icon: [
      // วิธีใช้ Emoji เป็นไอคอน (สะดวก รวดเร็ว ไม่ต้องหารูป)
      {
        url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📅</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}