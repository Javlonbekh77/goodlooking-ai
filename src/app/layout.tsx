import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoodLooking — AI Hairstyle Try-On for Barbershops",
  description:
    "Preview real haircuts and fades on your own face with OpenAI GPT Image 2.5 Sunburst before visiting the barber.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#08080a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#050507]" suppressHydrationWarning>
      <body className="bg-[#050507] text-white antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
