import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/app/header";
import { Footer } from "@/app/footer";
import Provider from "@/app/api/trpc/[trpc]/provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trip Planner",
  description: "Efficiently plan your trip with ease",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="mytheme">
      <body className={inter.className}>
        <Provider>
          <Header />
          <main className="px-8 py-8">{children}</main>
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
