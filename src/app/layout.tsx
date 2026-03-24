import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI 제안서 생성기",
  description: "URL을 입력하면 AI가 제안서를 자동으로 생성합니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${dmSans.variable} ${sora.variable}`} suppressHydrationWarning>
      <head>
        {/* 다크 모드 깜박임 방지: 페인트 전에 클래스 적용 */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-screen antialiased">
        <div className="relative z-10 flex min-h-screen flex-col">
          <main className="flex-1 px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-5xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
