import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/app/header";
import { Footer } from "@/app/footer";
import Provider from "@/app/api/trpc/[trpc]/provider";
import GoogleMapProvider from "./components/google-map/provider";
import { AlertProvider } from "./components/alert";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trip Planner",
  description: "Efficiently plan your trip with ease"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dim" className="scroll-smooth dark">
      <body className={`${inter.className} scroll-smooth`}>
        <Provider>
          <GoogleMapProvider apiKey={process.env.GOOGLE_MAP_API_KEY ?? ""}>
            <AlertProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </AlertProvider>
          </GoogleMapProvider>
        </Provider>
      </body>
    </html>
  );
}
