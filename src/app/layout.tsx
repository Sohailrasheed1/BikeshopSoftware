import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/storage/context";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Shell } from "@/components/layout/shell";

export const metadata: Metadata = {
  title: "Skander Spare Parts — Complete Shop Management System",
  description:
    "Professional motorcycle spare parts shop management software for Skander Spare Parts, Karachi. Inventory, billing, customer tracking, reports, and supplier credit management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-slate-900 bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>
          <StoreProvider>
            <Shell>{children}</Shell>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
