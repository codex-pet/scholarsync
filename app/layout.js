"use client";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  return (
    <html lang="en">
      <body className="flex min-h-screen">
        {!isAuthPage && <Sidebar />}
        <main className={`flex-1 transition-all duration-500 ${!isAuthPage ? "pl-24 lg:pl-32" : ""}`}>
          {children}
        </main>
      </body>
    </html>
  );
}