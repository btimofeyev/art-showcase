import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: SITE.siteTitle,
    template: `%s · ${SITE.siteTitle}`,
  },
  description: SITE.siteDescription,
  openGraph: {
    title: SITE.siteTitle,
    description: SITE.siteDescription,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f2ec",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${syne.variable} h-full`}>
      <body className="min-h-full bg-canvas text-foreground antialiased pb-[env(safe-area-inset-bottom)]">
        {children}
      </body>
    </html>
  );
}
