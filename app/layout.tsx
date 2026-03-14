import type {Metadata} from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'كاجو صوتيات | تحويل النص إلى صوت احترافي',
  description: 'تطبيق متطور لتحويل النصوص العربية إلى أصوات احترافية بلهجات متعددة',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <body suppressHydrationWarning className="font-cairo antialiased bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}
