import type { Metadata } from "next";
import { Abel } from "next/font/google";
import "./globals.css";
import "./background.css";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster } from 'react-hot-toast';

const abel = Abel({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "(CU)^2M",
  description: "Your course ultimate management is powered (CU)^2M",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${abel.className} antialiased`}>
        <div className="animated-lines z-0"></div>
        <div className="h-screen w-screen bg-radial-[at_50%_50%] from-white via-zinc-100 to-zinc-200">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
