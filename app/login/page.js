"use client";
import { useState } from 'react';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

export default function Auth() {
  const [isNew, setIsNew] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF9F6]">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-2xl p-10 border border-white">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-[#D1D1FF]/20 p-4 rounded-3xl mb-4 text-[#D1D1FF]"><Sparkles size={40}/></div>
          <h1 className="text-3xl">{isNew ? 'Join ScholarSync' : 'Welcome Back'}</h1>
          <p className="text-slate-400 text-sm mt-2">Start your AI-powered learning journey</p>
        </div>

        <form className="space-y-4">
          {isNew && <input type="text" placeholder="Full Name" className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none" />}
          <input type="email" placeholder="Email" className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none" />
          <input type="password" placeholder="Password" className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none" />
          <Link href="/" className="block w-full bg-[#D1D1FF]/40 text-slate-700 py-4 rounded-2xl font-bold text-center mt-6">
            {isNew ? 'Create Account' : 'Sign In'}
          </Link>
        </form>

        <button onClick={() => setIsNew(!isNew)} className="w-full mt-10 py-4 border rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">
          {isNew ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}