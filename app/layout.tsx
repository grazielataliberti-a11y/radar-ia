import type { Metadata } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Radar de Casos de Uso de IA",
  description:
    "Mural da turma — o que a inteligência artificial já resolve (ou pode resolver) no seu ofício",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sourceSans.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
