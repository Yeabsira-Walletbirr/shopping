import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import YourCartButton from "@/components/cartButton";
import { CartProvider } from "@/contexts/CartContext";
import TransparentResponsiveHeader from "@/components/HeaderDrawer";
import { Box } from "@mui/material";
import { UserProvider } from "@/contexts/UserContext";
import { MapProvider } from "@/contexts/MapContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { CookiesProvider } from 'next-client-cookies/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIAMart",
  description: "VIAMart",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{ backgroundColor: 'white' }}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CookiesProvider>
          <UserProvider>
            <CartProvider>
              <TransparentResponsiveHeader />
              <MapProvider>
                <LocationProvider>
                  <Box paddingTop={8}>
                    {children}
                  </Box>
                </LocationProvider>
              </MapProvider>
              <YourCartButton />
            </CartProvider>
          </UserProvider>
        </CookiesProvider>
      </body>
    </html>
  );
}
