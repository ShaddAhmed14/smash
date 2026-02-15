import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from 'next-themes';
import CarbonThemeProvider from '@/components/CarbonThemeProvider';
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "SMASH",
  description: "Synthesis and Multimodal Analytics System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plexSans.variable} ${plexMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider attribute="class" defaultTheme="system">
          <CarbonThemeProvider>
            {children}
          </CarbonThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
