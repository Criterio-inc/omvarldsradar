import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmvärldsRadar - AI-driven omvärldsbevakning för svensk offentlig sektor",
  description:
    "AI-driven omvärldsbevakning och analys för svenska kommuner och regioner. Bevaka EU-regelverk, nationella reformer och globala trender.",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "OmvärldsRadar",
    description: "AI-driven omvärldsbevakning för svensk offentlig sektor",
    images: [{ url: "/omvarldsradar-logo.png", width: 512, height: 512 }],
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "OmvärldsRadar",
    description: "AI-driven omvärldsbevakning för svensk offentlig sektor",
    images: ["/omvarldsradar-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif4.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
