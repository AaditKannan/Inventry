import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StarField from "@/components/ui/StarField";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventry - Robotics Inventory & Part Lending",
  description: "Community-driven robotics inventory and part lending platform for FTC/robotics teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative">
          {/* Beautiful twinkling stars on every page */}
          <StarField />
          {children}
        </div>
      </body>
    </html>
  );
}
