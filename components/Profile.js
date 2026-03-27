"use client";
import React from 'react';

export default function Profile() {
    return (
        <div className="fixed bottom-3 left-6 z-[60]">
            <div className="group flex items-center gap-0 hover:gap-3 cursor-pointer p-1.5 rounded-full transition-all duration-500 ease-in-out
        
        /* MATCHING THE SIDEBAR GLASS */
        bg-white/[0.15] 
        bg-gradient-to-r from-white/20 via-transparent to-white/10
        backdrop-blur-2xl backdrop-saturate-[1.8]
        border border-white/40
        shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]
        hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]
        hover:bg-white/30
      ">
                {/* Avatar Container */}
                <div className="w-11 h-11 rounded-full border-2 border-white/60 overflow-hidden shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105 relative z-10">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jade"
                        alt="User"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Text Area - Slides out on Hover */}
                <div className="flex flex-col max-w-0 overflow-hidden opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:pr-4 transition-all duration-500 ease-in-out">
                    <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                        Jade Smith
                    </span>
                    <span className="text-[10px] font-medium text-indigo-600/80 uppercase tracking-wider whitespace-nowrap">
                        Pro Plan
                    </span>
                </div>
            </div>
        </div>
    );
}