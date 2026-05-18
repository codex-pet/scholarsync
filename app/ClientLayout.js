// app/ClientLayout.js
"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Profile from '@/components/Profile';
import { Menu, X, Clock, ShieldX, Ban, LogOut } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

/* ── Status Gate Screens ─────────────────────────────────────────── */
function StatusScreen({ status, onSignOut }) {
    const configs = {
        pending: {
            icon: <Clock size={48} className="text-amber-500" />,
            bg: 'from-amber-50 to-orange-50',
            badge: 'bg-amber-100 text-amber-700 border-amber-200',
            badgeText: 'Pending Approval',
            title: 'Your account is under review',
            desc: 'Thank you for registering! An administrator will review your account and approve your access shortly.',
            btnColor: 'bg-amber-500 hover:bg-amber-600',
        },
        rejected: {
            icon: <ShieldX size={48} className="text-rose-500" />,
            bg: 'from-rose-50 to-pink-50',
            badge: 'bg-rose-100 text-rose-700 border-rose-200',
            badgeText: 'Registration Rejected',
            title: 'Your registration was rejected',
            desc: 'Unfortunately, your account registration has been declined. Please contact support if you believe this is an error.',
            btnColor: 'bg-rose-500 hover:bg-rose-600',
        },
        suspended: {
            icon: <Ban size={48} className="text-slate-500" />,
            bg: 'from-slate-50 to-gray-50',
            badge: 'bg-slate-100 text-slate-700 border-slate-200',
            badgeText: 'Account Suspended',
            title: 'Your account has been suspended',
            desc: 'Your account has been temporarily suspended. Please contact an administrator for more information.',
            btnColor: 'bg-slate-600 hover:bg-slate-700',
        },
    };

    const c = configs[status];
    if (!c) return null;

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${c.bg} px-4`}>
            <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto mb-6">
                    {c.icon}
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${c.badge} mb-4`}>
                    {c.badgeText}
                </span>
                <h1 className="text-2xl font-bold text-slate-800 mb-3">{c.title}</h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">{c.desc}</p>
                <button
                    onClick={onSignOut}
                    className={`flex items-center gap-2 mx-auto px-6 py-3 rounded-xl text-white font-semibold text-sm transition-colors ${c.btnColor}`}
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null); // { role, status }

    // Route detection logic
    const isLandingPage = pathname === '/';
    const isLoginPage = pathname === '/login';
    const isAdminRoute = pathname.startsWith('/admin');
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

    // Auth state listener + Firestore profile listener
    useEffect(() => {
        let profileUnsub = null;

        const authUnsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                // Subscribe to the user's Firestore document for real-time status updates
                if (db) {
                    const userDocRef = doc(db, 'users', user.uid);
                    profileUnsub = onSnapshot(userDocRef, (snap) => {
                        if (snap.exists()) {
                            setUserProfile(snap.data());
                        } else {
                            // No document: legacy account — treat as approved regular user
                            setUserProfile({ role: 'user', status: 'approved' });
                        }
                        setIsAuthLoading(false);
                    }, () => {
                        setUserProfile({ role: 'user', status: 'approved' });
                        setIsAuthLoading(false);
                    });
                } else {
                    setIsAuthLoading(false);
                }
            } else {
                setIsAuthenticated(false);
                setUserProfile(null);
                if (profileUnsub) { profileUnsub(); profileUnsub = null; }
                if (isDashboardRoute) {
                    router.push('/login');
                }
                setIsAuthLoading(false);
            }
        });

        return () => {
            authUnsub();
            if (profileUnsub) profileUnsub();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDashboardRoute]);

    async function handleSignOut() {
        await signOut(auth);
        router.push('/login');
    }

    // Guard: If on a dashboard route and user is loaded but status is not approved/admin, show status screen
    const isAdmin = userProfile?.role === 'admin';
    const userStatus = userProfile?.status;
    // Only block if userProfile is loaded AND status is explicitly set to a non-approved value
    // Treat undefined/null status as 'approved' for backward compatibility
    const isAccessBlocked = isDashboardRoute && isAuthenticated && userProfile
        && !isAdmin
        && userStatus != null
        && userStatus !== 'approved';

    // Guard: If on admin route but user is not admin, redirect
    useEffect(() => {
        if (!isAuthLoading && isAdminRoute && userProfile && !isAdmin) {
            router.replace('/dashboard');
        }
    }, [isAuthLoading, isAdminRoute, userProfile, isAdmin, router]);

    return (
        <body className="bg-[#F8FAFC] min-h-screen relative overflow-x-hidden" suppressHydrationWarning>
            {isAuthLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : isAccessBlocked ? (
                <StatusScreen status={userStatus} onSignOut={handleSignOut} />
            ) : (
                <>
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
                                userRole={userProfile?.role}
                            />
                        </div>
                    )}

                    {/* ── Desktop Sidebar ── */}
                    {isDashboardRoute && (
                        <div className="hidden lg:block">
                            <Sidebar
                                isExpanded={isExpanded}
                                setIsExpanded={setIsExpanded}
                                userRole={userProfile?.role}
                            />
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
                        <div className="max-w-[1600px] mx-auto">
                            {children}
                        </div>
                    </main>
                </>
            )}
        </body>
    );
}
