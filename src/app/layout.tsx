import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'SplitBill — Hitung Patungan Tanpa Drama',
  description: 'Website untuk menghitung split bill dengan cepat, rapi, dan transparan.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="flex flex-col min-h-screen bg-stone-50 font-sans antialiased text-stone-900">
        <Header />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
