import type { Metadata } from "next";
import { Instrument_Serif, Work_Sans } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/data/site-settings";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { gtmId, metaPixelId } = await getSiteSettings();

  return (
    <html lang="pt-BR" className={`${instrumentSerif.variable} ${workSans.variable}`}>
      {gtmId && (
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      {metaPixelId && (
        <Script id="meta-pixel-script" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
      <body>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {metaPixelId && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              alt=""
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
