// app/ClientLayout.js
"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Profile from '@/components/Profile';
import AuthPage from '@/components/AuthPage';
import { Menu, X } from 'lucide-react';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Route detection logic
    const isLandingPage = pathname === '/';
    const isLoginPage = pathname === '/login';
    const isDashboardRoute = !isLandingPage && !isLoginPage;

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileOpen]);

    return (
        <body className="bg-[#F8FAFC] min-h-screen relative overflow-x-hidden">
            {/* Background Blobs */}
            {isDashboardRoute && (
                <>
                    <div className="fixed top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-indigo-200/40 rounded-full blur-[120px] -z-10 pointer-events-none" />
                    <div className="fixed bottom-[-5%] left-[-2%] w-[25rem] h-[25rem] bg-purple-200/40 rounded-full blur-[100px] -z-10 pointer-events-none" />
                </>
            )}

            {/* ── Mobile Header ── */}
            {isDashboardRoute && (
                <header className="lg:hidden fixed top-0 left-0 right-0 h-16 glass z-[70] flex items-center justify-between px-4 sm:px-6">
                    {/* Hamburger */}
                    <button
                        id="hamburger-menu"
                        aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={isMobileOpen}
                        aria-controls="mobile-sidebar"
                        onClick={() => setIsMobileOpen(prev => !prev)}
                        className="p-2 rounded-xl bg-white/40 border border-white/50 text-slate-700 hover:bg-white/70 hover:text-indigo-600 transition-all focus-visible:ring-2 focus-visible:ring-indigo-300 outline-none"
                    >
                        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img src="/scholarsync-logo.png" alt="ScholarSync Logo" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-slate-800 text-sm tracking-tight">ScholarSync</span>
                    </div>

                    {/* Profile */}
                    {isAuthenticated && (
                        <div className="flex items-center">
                            <Profile isMobile />
                        </div>
                    )}
                </header>
            )}

            {/* ── Mobile Overlay Backdrop ── */}
            {isDashboardRoute && isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[75]"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Mobile Sidebar Drawer ── */}
            {isDashboardRoute && (
                <div
                    id="mobile-sidebar"
                    role="navigation"
                    aria-label="Mobile navigation"
                    className={`
                        lg:hidden fixed top-0 left-0 h-full w-72 z-[80]
                        transition-transform duration-300 ease-in-out
                        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <Sidebar
                        isExpanded={true}
                        setIsExpanded={() => {}}
                        isMobileDrawer={true}
                        onClose={() => setIsMobileOpen(false)}
                    />
                </div>
            )}

            {/* ── Desktop Sidebar ── */}
            {isDashboardRoute && (
                <div className="hidden lg:block">
                    <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                </div>
            )}

            {/* ── Desktop Profile ── */}
            {isDashboardRoute && isAuthenticated && (
                <div className="hidden lg:block">
                    <Profile />
                </div>
            )}

            {/* ── Main Content ── */}
            <main
                className={`transition-all duration-500
                    ${isDashboardRoute
                        ? `pt-16 lg:pt-8 ${isExpanded ? 'lg:pl-72' : 'lg:pl-32'} px-3 sm:px-4 lg:px-8`
                        : ''
                    }`}
            >
                {isDashboardRoute && !isAuthenticated ? (
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />
                    </div>
                ) : (
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                )}
            </main>
        </body>
    );
}
