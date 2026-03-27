// app/ClientLayout.js
"use client";
import Sidebar from "@/components/Sidebar";
import Profile from "@/components/Profile";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const isAuthPage = pathname === "/login";
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    return (
        <body className="flex min-h-screen">
            {!isAuthPage && (
                <Sidebar
                    isExpanded={isSidebarExpanded}
                    setIsExpanded={setIsSidebarExpanded}
                />
            )}
            {!isAuthPage && <Profile />}
            <main className={`flex-1 transition-all duration-300 ${!isAuthPage ? (isSidebarExpanded ? "pl-[220px]" : "pl-32") : ""}`}>
                {children}
            </main>
        </body>
    );
}