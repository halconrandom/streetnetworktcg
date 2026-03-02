import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Street Games & Books Collector",
  description: "A TCG card collection platform for a GTA V roleplay server, featuring Pokemon, Yugioh, and Magic cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
