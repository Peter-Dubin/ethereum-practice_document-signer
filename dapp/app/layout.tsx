import type { Metadata } from "next";
import { WalletProvider } from "@/contexts/WalletContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Document Signer - Ethereum dApp",
  description: "Store and verify document authenticity using Ethereum blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
