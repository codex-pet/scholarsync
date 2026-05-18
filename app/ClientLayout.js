// app/ClientLayout.js
"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Profile from '@/components/Profile'; // Import the new Profile
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Route detection logic
    const isLandingPage = pathname === '/';
    const isLoginPage = pathname === '/login';
    const isDashboardRoute = !isLandingPage && !isLoginPage;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                if (isDashboardRoute) {
                    router.push('/login');
                }
            }
            setIsAuthLoading(false);
        });
        return () => unsubscribe();
    }, [isLoginPage, isDashboardRoute, router]);

    return (
        <body className="bg-[#F8FAFC] min-h-screen relative overflow-x-hidden">
            {isAuthLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Background Blobs — shown on dashboard routes */}
                    {isDashboardRoute && (
                        <>
                            <div className="fixed top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-indigo-200/40 rounded-full blur-[120px] -z-10" />
                            <div className="fixed bottom-[-5%] left-[-2%] w-[25rem] h-[25rem] bg-purple-200/40 rounded-full blur-[100px] -z-10" />
                        </>
                    )}

                    {/* Floating Sidebar — only on dashboard routes (regardless of auth) */}
                    {isDashboardRoute && (
                        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                    )}

                    {/* Independent Floating Profile — only on dashboard routes when authenticated */}
                    {isDashboardRoute && isAuthenticated && <Profile />}

                    {/* Main Content Area */}
                    <main className={`transition-all duration-500 ${isDashboardRoute ? (isExpanded ? 'pl-72' : 'pl-32') : ''}`}>
                        {children}
                    </main>
                </>
            )}
        </body>
    );
}

