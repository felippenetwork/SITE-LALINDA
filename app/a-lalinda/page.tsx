import type { Metadata } from "next";
import { AboutPageClient } from "./AboutPageClient";

export const metadata: Metadata = {
  title: "A La Linda | Nossa História e Tradição",
  description:
    "Conheça a história da La Linda Pães Especiais, nossa missão, visão e o segredo por trás de nossos pães artesanais.",
  openGraph: {
    title: "A La Linda | Nossa História e Tradição",
    description:
      "Conheça a história da La Linda Pães Especiais, nossa missão, visão e o segredo por trás de nossos pães artesanais.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
