import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppContext } from "@/libs/context/app-context";
import AppLayout from "@/components/app-layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Analysator",
  description:
    "Analysator takes in a URL and returns a structured analysis of a landing page, including company name, business model, key features, target market and likely competitors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={` ${inter.variable} `}>
      <AppContext>
        <body className="min-w-80 overflow-x-hidden">
          <AppLayout>{children}</AppLayout>
        </body>
      </AppContext>
    </html>
  );
}
