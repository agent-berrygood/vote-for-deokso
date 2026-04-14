import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';

export const metadata: Metadata = {
  title: '높은뜻덕소교회 전교인 설문조사',
  description: '높은뜻덕소교회 전교인 설문조사 시스템',
  openGraph: {
    title: '높은뜻덕소교회 전교인 설문조사',
    description: '높은뜻덕소교회 전교인 설문조사 시스템',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
