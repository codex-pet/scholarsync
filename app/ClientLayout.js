// app/ClientLayout.js
"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Profile from '@/components/Profile'; // Import the new Profile
import AuthPage from '@/components/AuthPage';

export default function ClientLayout({ children }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
    return (
        <body className="bg-[#F8FAFC]">
            <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />
        </body>
    );
}

    return (
        <body className="bg-[#F8FAFC] min-h-screen relative overflow-x-hidden">
            {/* 1. Background Blobs (Essential for Glass look) */}
            <div className="fixed top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-indigo-200/40 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-[-5%] left-[-2%] w-[25rem] h-[25rem] bg-purple-200/40 rounded-full blur-[100px] -z-10" />

            {/* 2. Floating Sidebar */}
            <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

            {/* 3. Independent Floating Profile */}
            <Profile />

            {/* 4. Main Content */}
            <main className={`transition-all duration-500 ${isExpanded ? 'pl-72' : 'pl-32'}`}>
                {children}
            </main>
        </body>
    );
}