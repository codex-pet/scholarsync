"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function Profile({ isMobile = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [userName, setUserName] = useState('Loading...');
    const [userPhoto, setUserPhoto] = useState(null);
    const [userEmail, setUserEmail] = useState('');
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

    // Read user info from auth and localStorage
    function updateProfile() {
        const user = auth.currentUser;
        if (!user) return;

        // Display name
        let name = user.displayName;
        if (!name) {
            const prefix = user.email?.split('@')[0] || '';
            name = prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : 'User';
        }
        setUserName(name);

        // Avatar: prefer localStorage (set by Settings page), fallback to Firebase photoURL
        const localAvatar = localStorage.getItem(`avatar_${user.uid}`);
        if (localAvatar === 'removed') {
            setUserPhoto(null);
        } else {
            setUserPhoto(localAvatar || user.photoURL || null);
        }

        // Email: prefer localStorage (set by Settings page), fallback to Firebase Auth
        const localEmail = localStorage.getItem(`email_${user.uid}`);
        setUserEmail(localEmail || user.email || '');
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                updateProfile();
            } else {
                setUserName('Guest');
                setUserPhoto(null);
            }
        });

        // Listen for profile updates dispatched from Settings page
        window.addEventListener('profileUpdated', updateProfile);

        return () => {
            unsubscribe();
            window.removeEventListener('profileUpdated', updateProfile);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const initials = userName !== 'Loading...' && userName !== 'Guest'
        ? userName.charAt(0).toUpperCase()
        : '?';

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
                    className={`absolute ${isMobile ? 'top-[calc(100%+0.5rem)] right-0' : 'bottom-full left-0 mb-3'} w-48 p-1.5 rounded-2xl transition-all duration-300 ease-in-out
                    bg-white/[0.85] backdrop-blur-2xl backdrop-saturate-[1.8]
                    border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] z-[70]`}
                >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{userEmail}</p>
                    </div>

                    <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-start gap-2 px-3 py-2 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors focus-visible:ring-2 focus-visible:ring-red-100 outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                suppressHydrationWarning={true}
                className={`group flex items-center gap-0 hover:gap-3 cursor-pointer p-1.5 rounded-full transition-all duration-500 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-indigo-200
                bg-white/${isMobile ? '40' : '0.15'} 
                ${!isMobile ? 'bg-gradient-to-r from-white/20 via-transparent to-white/10' : ''}
                backdrop-blur-2xl backdrop-saturate-[1.8]
                border border-white/40
                shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
                hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)]
                hover:bg-white/30`}
            >
                {/* Avatar */}
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border-2 border-white/60 overflow-hidden shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105 relative z-10 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-sm lg:text-lg">
                    {userPhoto
                        ? <img src={userPhoto} alt="User Profile Avatar" className="w-full h-full object-cover" />
                        : <span>{initials}</span>
                    }
                </div>

                {/* Text Area - Slides out on Hover */}
                <div className={`flex flex-col max-w-0 overflow-hidden opacity-0 ${!isMobile ? 'group-hover:max-w-[150px] group-hover:opacity-100 group-hover:pr-4' : ''} transition-all duration-500 ease-in-out`}>
                    {!isMobile && (
                        <>
                            <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                                {userName}
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