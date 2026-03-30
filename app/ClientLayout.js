// app/ClientLayout.js
"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Profile from '@/components/Profile';

export default function ClientLayout({ children }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const pathname = usePathname();

    // Auth pages ("/", "/login") get a clean layout — no sidebar, no profile
    const authRoutes = ['/', '/login'];
    const isDashboardRoute = !authRoutes.includes(pathname);

    return (
        <body className="bg-[#F8FAFC] min-h-screen relative overflow-x-hidden">
            {/* Background Blobs — shown on dashboard routes */}
            {isDashboardRoute && (
                <>
                    <div className="fixed top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-indigo-200/40 rounded-full blur-[120px] -z-10" />
                    <div className="fixed bottom-[-5%] left-[-2%] w-[25rem] h-[25rem] bg-purple-200/40 rounded-full blur-[100px] -z-10" />
                </>
            )}

            {/* Floating Sidebar — only on dashboard routes */}
            {isDashboardRoute && (
                <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            )}

            {/* Independent Floating Profile — only on dashboard routes */}
            {isDashboardRoute && <Profile />}

            {/* Main Content */}
            <main className={`transition-all duration-500 ${isDashboardRoute ? (isExpanded ? 'pl-72' : 'pl-32') : ''}`}>
                {children}
            </main>
        </body>
    );
}