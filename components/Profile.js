"use client";

export default function Profile() {
    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-row items-center p-2">
            <div className="group flex items-center gap-0 hover:gap-3 cursor-pointer p-1 rounded-full transition-all duration-300">
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-300 relative z-10">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jade" alt="User" />
                </div>
                <span className="text-sm font-semibold text-slate-700 max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-500 whitespace-nowrap opacity-0 group-hover:opacity-100">
                    Jade Smith
                </span>
            </div>
        </div>
    );
}
