"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile({ isMobile = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const router = useRouter();

    // Close the popup if the user clicks outside of it
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = () => {
        router.push('/');
    };

    return (
        <div 
            ref={menuRef} 
            className={`${isMobile ? 'relative' : 'fixed bottom-3 left-6'} z-[60]`}
        >

            {/* Pop-up Menu */}
            {isOpen && (
                <div 
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="profile-button"
                    className={`absolute ${isMobile ? 'top-[calc(100%+0.5rem)] right-0' : 'bottom-full left-0 mb-3'} w-40 p-1.5 rounded-2xl transition-all duration-300 ease-in-out
                    bg-white/[0.8] backdrop-blur-2xl backdrop-saturate-[1.8]
                    border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] z-[70]`}
                >
                    <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-start gap-2 px-3 py-2 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors focus-visible:ring-2 focus-visible:ring-red-100 outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </button>
                </div>
            )}

            {/* Main Profile Button */}
            <button
                id="profile-button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="User Profile"
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-0 hover:gap-3 cursor-pointer p-1.5 rounded-full transition-all duration-500 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-indigo-200
                bg-white/${isMobile ? '40' : '0.15'} 
                ${!isMobile ? 'bg-gradient-to-r from-white/20 via-transparent to-white/10' : ''}
                backdrop-blur-2xl backdrop-saturate-[1.8]
                border border-white/40
                shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]
                hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]
                hover:bg-white/30`}
            >
                {/* Avatar Container */}
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border-2 border-white/60 overflow-hidden shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105 relative z-10">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jade"
                        alt="User Profile Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Text Area - Slides out on Hover */}
                <div className={`flex flex-col max-w-0 overflow-hidden opacity-0 ${!isMobile ? 'group-hover:max-w-[150px] group-hover:opacity-100 group-hover:pr-4' : ''} transition-all duration-500 ease-in-out`}>
                    {!isMobile && (
                        <>
                            <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                                Jade Smith
                            </span>
                            <span className="text-[10px] font-medium text-indigo-600/80 uppercase tracking-wider whitespace-nowrap">
                                Pro Plan
                            </span>
                        </>
                    )}
                </div>
            </button>
        </div>
    );
}