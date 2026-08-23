import type { Metadata } from "next";
import { Instrument_Serif, Work_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Linda | Pães Especiais",
  description: "Excelência em panificação artesanal.",
  openGraph: {
    title: "La Linda | Pães Especiais",
    description: "Excelência em panificação artesanal.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${instrumentSerif.variable} ${workSans.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
