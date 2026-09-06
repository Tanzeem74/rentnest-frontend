import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "RentNest - Find & List Rental Properties",
  description: "A modern rental property marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
