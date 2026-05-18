"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged, updateProfile, updatePassword,
  signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { HardDrive, Eye, EyeOff, Trash2, LogOut, Database, Download, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("Account");

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null); // base64
  const [saving, setSaving] = useState(false);

  // Password
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPassword, setCurrentPassword]   = useState("");
  const [newPassword, setNewPassword]             = useState("");
  const [showCurrentPw, setShowCurrentPw]         = useState(false);
  const [showNewPw, setShowNewPw]                 = useState(false);

  // Photo Viewer
  const [viewingPhoto, setViewingPhoto] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        // Prefer individually-saved names from localStorage (preserves multi-word first names)
        const savedFirst = localStorage.getItem(`firstName_${u.uid}`);
        const savedLast  = localStorage.getItem(`lastName_${u.uid}`);
        if (savedFirst !== null) {
          setFirstName(savedFirst);
          setLastName(savedLast || "");
        } else {
          // Fallback: split displayName by first space only
          const spaceIdx = (u.displayName || "").indexOf(" ");
          if (spaceIdx === -1) {
            setFirstName(u.displayName || "");
            setLastName("");
          } else {
            setFirstName((u.displayName || "").substring(0, spaceIdx));
            setLastName((u.displayName || "").substring(spaceIdx + 1));
          }
        }
        // Load saved avatar from localStorage
        const saved = localStorage.getItem(`avatar_${u.uid}`);
        if (saved === 'removed') {
          setAvatarPreview(null);
        } else if (saved) {
          setAvatarPreview(saved);
        } else if (u.photoURL) {
          setAvatarPreview(u.photoURL);
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Handle image file selected
  function handleAvatarFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("File must be under 10MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const displayName = `${firstName} ${lastName}`.trim();

      // Save firstName & lastName individually so multi-word names are preserved on reload
      localStorage.setItem(`firstName_${user.uid}`, firstName);
      localStorage.setItem(`lastName_${user.uid}`, lastName);

      // Save avatar to localStorage so it persists without Firebase Storage
      if (avatarPreview && avatarPreview !== user.photoURL) {
        localStorage.setItem(`avatar_${user.uid}`, avatarPreview);
      } else if (!avatarPreview) {
        localStorage.setItem(`avatar_${user.uid}`, "removed");
      }

      await updateProfile(user, { displayName });
      await setDoc(doc(db, "users", user.uid), {
        displayName,
        firstName,
        lastName,
        email: user.email,
        avatarUpdated: Date.now()
      }, { merge: true });

      // Broadcast update to Header & Profile components
      window.dispatchEvent(new Event("profileUpdated"));
      alert("Profile saved successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    }
    setSaving(false);
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (!user || !newPassword || !currentPassword) return;
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");
      setCurrentPassword(""); setNewPassword(""); setShowChangePw(false);
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        alert("The current password you entered is incorrect.");
      } else {
        alert("Error: " + err.message);
      }
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    router.push("/");
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Are you absolutely sure? This will permanently delete your account.")) return;
    try {
      await deleteUser(user);
      router.push("/");
    } catch (err) {
      alert("Error: " + err.message + "\n(You may need to sign in again before deleting.)");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TABS = [
    { id: "Account", label: "Account" },
    { id: "Storage", label: "Storage" },
  ];

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user?.email?.charAt(0).toUpperCase();

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/50">
        <header>
          <h1 className="text-3xl text-slate-800 tracking-tight font-bold">Settings</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage your account and local data.</p>
        </header>

        <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl border border-white/60 shadow-sm shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-indigo-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── ACCOUNT TAB ── */}
      {activeTab === "Account" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Card 1: Profile Information */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Profile Information</h2>
              <p className="text-sm text-slate-500 mt-0.5">Update your photo and personal details.</p>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <button 
                  type="button" 
                  onClick={() => avatarPreview && setViewingPhoto(true)}
                  className={`w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-black border-4 border-white shadow-md shrink-0 transition-all ${avatarPreview ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}`}
                >
                  {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : initials}
                </button>

                <div className="space-y-2">
                  <p className="font-bold text-slate-700">Profile Picture</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                      Upload Image
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        Remove
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">We support PNGs, JPEGs and GIFs under 10MB</p>
                </div>
              </div>

              <div className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Email</label>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-400 font-medium text-sm cursor-not-allowed"
                    />
                    <button type="button" className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm shrink-0">
                      Edit Email
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-medium pl-1">Used to log in to your account</p>
                </div>
              </div>

              {/* Profile Action Footer */}
              <div className="px-8 py-5 bg-slate-50/60 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const parts = (user?.displayName || "").split(" ");
                    setFirstName(parts[0] || "");
                    setLastName(parts.slice(1).join(" ") || "");
                    const savedAvatar = localStorage.getItem(`avatar_${user?.uid}`);
                    setAvatarPreview(savedAvatar === 'removed' ? null : (savedAvatar || null));
                  }}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 disabled:opacity-60 flex items-center gap-2"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Password Section */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Password</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage your account security and login credentials.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePw(!showChangePw)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm shrink-0"
              >
                {showChangePw ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showChangePw && (
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm"
                        required
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                        {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 6 chars)"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm"
                        minLength={6}
                        required
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleUpdatePassword}
                      className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Danger Zone */}
          <div className="bg-rose-50/50 backdrop-blur-xl border border-rose-100 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-rose-600 text-lg">Danger Zone</h3>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">Sign out or permanently delete your account and data.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={handleSignOut} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm active:scale-95">
                  <LogOut size={16} /> Sign Out
                </button>
                <button onClick={handleDeleteAccount} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors shadow-sm active:scale-95">
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── STORAGE TAB ── */}
      {activeTab === "Storage" && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm divide-y divide-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-8 py-6">
            <h2 className="text-xl font-bold text-slate-800">Storage</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">ScholarSync uses local browser storage for your PDFs and Study Sets — blazing fast and free.</p>
          </div>

          <div className="px-8 py-6 space-y-4">
            <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-end">
                <span className="font-bold text-sm text-slate-700">Estimated Local Usage</span>
                <span className="font-black text-indigo-600 text-2xl">~45 MB</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-[15%] h-full rounded-full" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 text-right uppercase tracking-wider">~15% of browser quota</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95">
                <Download size={18} className="text-slate-400" /> Export All Data
              </button>
              <button className="flex-1 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95">
                <Trash2 size={18} /> Clear Local Cache
              </button>
            </div>
          </div>
        </div>
      )}
      {viewingPhoto && avatarPreview && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-300"
          onClick={() => setViewingPhoto(false)}
        >
          <div className="relative max-w-xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setViewingPhoto(false)} 
              className="absolute -top-12 right-0 sm:-right-12 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            <img 
              src={avatarPreview} 
              alt="Enlarged Avatar" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-[2rem] shadow-2xl border-4 border-white/20" 
            />
          </div>
        </div>
      )}

    </div>
  );
}
