import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { TimerProvider } from "./(dashboard)/timer/TimerContext";
import RegisterServiceWorker from "@/components/pwa/RegisterServiceWorker";
import RoamingPet from "@/components/pet/RoamingPet";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Tracker",
  description: "Track your study progress and consistency.",
  verification: {
    google: "pxSaePZ0KZTmuDyvfAL_g55RVinI7BBuP8psvfMmiN0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <RegisterServiceWorker />
        <TimerProvider>
          {children}
          <RoamingPet />
        </TimerProvider>
            <Analytics />
      </body>
    </html>
  );
}