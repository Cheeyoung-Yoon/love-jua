import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "장미 두루마리 서신",
  description: "매듭을 풀고 펼쳐지는 서신을 체험하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-[var(--bg)] text-[var(--ink)] antialiased">{children}</body>
    </html>
  );
}
