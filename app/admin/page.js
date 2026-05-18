"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp, where, limit,
} from "firebase/firestore";
import {
  Users, UserCheck, Clock, Ban, ShieldCheck, Search, Filter,
  CheckCircle2, XCircle, PauseCircle, ChevronDown, RefreshCw,
  TrendingUp, AlertCircle, MoreHorizontal, Mail, Calendar,
  ShieldAlert, UserX, UserPlus, X, Activity, Sparkle
} from "lucide-react";
import { useToast, ToastContainer } from "@/components/Toast";

/* ── Utility: relative date ──────────────────────────────────────── */
function relativeDate(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/* ── Status config (Glassmorphic Colors) ─────────────────────────── */
const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "bg-amber-50 text-amber-700 border-amber-100 font-extrabold rounded-md",  icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-100 font-extrabold rounded-md", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-rose-50 text-rose-700 border-rose-100 font-extrabold rounded-md",   icon: XCircle },
  suspended:{ label: "Suspended",color: "bg-slate-100 text-slate-500 border-slate-200 font-extrabold rounded-md", icon: PauseCircle },
};

/* ── StatusBadge ─────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-extrabold border ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

/* ── Skeleton Row ────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-6 py-4.5">
          <div className="h-4 bg-slate-200/80 rounded-lg animate-pulse" style={{ width: `${[60,80,70,50,40,55][i-1]}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Stat Card (Premium Glassmorphic) ───────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bg, trend }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] p-6 bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value ?? "—"}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} ${bg} border shadow-inner`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-xs text-slate-400 font-medium leading-relaxed">{trend}</p>
    </div>
  );
}

/* ── Action Menu (Inline Buttons) ─────────────────────────────────── */
function ActionMenu({ user, onAction, currentUserUid }) {
  const isSelf = user.uid === currentUserUid;

  return (
    <div className="flex items-center gap-1.5">
      {/* Approve Button */}
      {(user.status === "pending" || user.status === "suspended" || user.status === "rejected") && (
        <button
          onClick={() => onAction(user, "approved")}
          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 border border-emerald-100 text-emerald-600 hover:text-white shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer"
          title="Approve User"
        >
          <CheckCircle2 size={12} />
        </button>
      )}

      {/* Reject Button (only for pending) */}
      {user.status === "pending" && (
        <button
          onClick={() => onAction(user, "rejected")}
          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 border border-rose-100 text-rose-600 hover:text-white shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer"
          title="Reject User"
        >
          <XCircle size={12} />
        </button>
      )}

      {/* Suspend Button (only for approved non-self) */}
      {user.status === "approved" && !isSelf && (
        <button
          onClick={() => onAction(user, "suspended")}
          className="p-2 rounded-xl bg-amber-50 hover:bg-amber-600 border border-amber-100 text-amber-600 hover:text-white shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer"
          title="Suspend User"
        >
          <PauseCircle size={12} />
        </button>
      )}

      {/* Admin Role Toggle Button (non-self) */}
      {!isSelf && (
        <button
          onClick={() => onAction(user, "admin")}
          className={`p-2 rounded-xl border shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer ${
            user.role === "admin"
              ? "bg-violet-50 border-violet-100 text-violet-600 hover:bg-violet-600 hover:text-white hover:border-violet-600"
              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-violet-600 hover:text-white hover:border-violet-600"
          }`}
          title={user.role === "admin" ? "Remove Admin Role" : "Make Admin"}
        >
          <ShieldCheck size={12} />
        </button>
      )}

      {/* Self Indicator */}
      {isSelf && (
        <span className="text-[10px] text-slate-400 font-extrabold uppercase px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md">
          You
        </span>
      )}
    </div>
  );
}

/* ── Bar Chart (pure CSS) ────────────────────────────────────────── */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-3.5 h-32 px-2 mt-4 justify-center">
      {data.map(d => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 max-w-[64px]">
          <span className="text-xs font-black text-slate-700 leading-none">{d.value}</span>
          <div 
            className="w-full rounded-t-xl transition-all duration-1000 ease-out" 
            style={{ 
              height: `${(d.value / max) * 90}px`, 
              backgroundColor: d.color,
              boxShadow: `0 4px 12px ${d.color}25`
            }} 
          />
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-tight truncate w-full text-center mt-1">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Admin Page ─────────────────────────────────────────────── */
const FILTERS = ["All", "Pending", "Approved", "Rejected", "Suspended"];
const ROLE_FILTERS = ["All", "Students", "Admins"];

export default function AdminPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const { toasts, toast, dismissToast } = useToast();
  const [currentUid, setCurrentUid] = useState(null);

  // Add Admin Modal States
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail]   = useState("");
  const [modalLoading, setModalLoading]     = useState(false);
  const [modalError, setModalError]         = useState("");

  // Get current user uid
  useEffect(() => {
    import("@/lib/firebase").then(({ auth }) => {
      import("firebase/auth").then(({ onAuthStateChanged }) => {
        const unsub = onAuthStateChanged(auth, (u) => { if (u) setCurrentUid(u.uid); });
        return () => unsub();
      });
    });
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleAction(user, action) {
    try {
      const ref = doc(db, "users", user.uid);
      if (action === "admin") {
        const newRole = user.role === "admin" ? "user" : "admin";
        await updateDoc(ref, { role: newRole, updatedAt: serverTimestamp() });
        setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, role: newRole } : u));
        toast.success(
          `${user.displayName || user.email} is now ${newRole === "admin" ? "an Admin" : "a regular User"}.`,
          newRole === "admin" ? "Granted full administrative privileges." : "Revoked administrative access."
        );
      } else {
        await updateDoc(ref, { status: action, updatedAt: serverTimestamp() });
        setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, status: action } : u));
        toast.success(
          `${user.displayName || user.email} status updated to ${action}.`,
          `Account access is now set to ${action}.`
        );
      }
    } catch {
      toast.error("Failed to update user.", "An error occurred while updating the status/role in Firestore.");
    }
  }

  async function handleAddAdmin(e) {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    setModalLoading(true);
    setModalError("");

    try {
      const emailQuery = newAdminEmail.trim().toLowerCase();
      const q = query(
        collection(db, "users"),
        where("email", "==", emailQuery),
        limit(1)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setModalError("No registered user found with this email. Users must sign up first before being promoted to admin.");
        setModalLoading(false);
        return;
      }

      const userDoc = snap.docs[0];
      const userData = userDoc.data();
      const ref = doc(db, "users", userDoc.id);

      await updateDoc(ref, {
        role: "admin",
        status: "approved",
        updatedAt: serverTimestamp()
      });

      // Update state locally
      setUsers(prev => prev.map(u => u.uid === userDoc.id ? { ...u, role: "admin", status: "approved" } : u));
      
      toast.success(`${userData.displayName || emailQuery} is now an Admin!`, "Instantly promoted and approved.");
      setIsAddAdminOpen(false);
      setNewAdminEmail("");
    } catch (err) {
      console.error(err);
      setModalError("Failed to add admin. Please try again.");
    } finally {
      setModalLoading(false);
    }
  }

  /* ── Derived data ── */
  const totalUsers    = users.length;
  const activeUsers   = users.filter(u => u.status === "approved").length;
  const pendingUsers  = users.filter(u => u.status === "pending").length;
  const suspendedUsers= users.filter(u => u.status === "suspended").length;
  const rejectedUsers = users.filter(u => u.status === "rejected").length;
  const adminUsers    = users.filter(u => u.role === "admin").length;

  const chartData = [
    { label: "Approved", value: activeUsers,   color: "#10b981" },
    { label: "Pending",  value: pendingUsers,  color: "#f59e0b" },
    { label: "Suspended",value: suspendedUsers,color: "#64748b" },
    { label: "Rejected", value: rejectedUsers, color: "#f43f5e" },
    { label: "Admins",   value: adminUsers,    color: "#8b5cf6" },
  ];

  const filteredUsers = users.filter(u => {
    const matchFilter = filter === "All" || u.status?.toLowerCase() === filter.toLowerCase();
    const matchRole = roleFilter === "All" ||
      (roleFilter === "Admins" && u.role === "admin") ||
      (roleFilter === "Students" && u.role !== "admin");
    const term = search.toLowerCase();
    const matchSearch = !term ||
      (u.displayName || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term);
    return matchFilter && matchRole && matchSearch;
  });

  return (
    <div className="min-h-screen pb-16">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Panel</h1>
            <p className="text-slate-500 text-sm">Manage user registrations, access approvals, and system roles</p>
          </div>
        </div>
        <button
          onClick={() => {
            setModalError("");
            setIsAddAdminOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.98] transition-all duration-200 text-white font-semibold text-sm cursor-pointer w-fit"
        >
          <UserPlus size={16} />
          Add Admin
        </button>
      </div>

      {/* ── Core Stat Cards Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}       label="Total Users"       value={totalUsers}    color="text-indigo-600"  bg="bg-indigo-50/70 border-indigo-100"   trend="All registered accounts" />
        <StatCard icon={UserCheck}   label="Active Users"      value={activeUsers}   color="text-emerald-600" bg="bg-emerald-50/70 border-emerald-100"  trend="Approved access" />
        <StatCard icon={Clock}       label="Pending Approvals" value={pendingUsers}  color="text-amber-600"   bg="bg-amber-50/70 border-amber-100"    trend="Awaiting review" />
        <StatCard icon={Ban}         label="Suspended"         value={suspendedUsers}color="text-slate-600"   bg="bg-slate-50/70 border-slate-100"    trend="Access blocked" />
      </div>

      {/* ── Visual Charts & Overview Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Distribution Bar Chart Card */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-sm p-6 relative overflow-hidden group">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-indigo-500" size={18} /> User Distribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Platform breakdown by registered account status</p>
          </div>
          {loading ? (
            <div className="h-32 flex items-end gap-3.5 px-2 mt-4">
              {[70, 40, 20, 30, 15].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-200/80 rounded-t-xl animate-pulse" style={{ height: h }} />
              ))}
            </div>
          ) : (
            <BarChart data={chartData} />
          )}
        </div>

        {/* Quick Stats Overview Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-sm p-6 flex flex-col justify-center">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-violet-500 animate-pulse" size={18} /> Quick Overview
          </h2>
          <div className="space-y-3">
            {[
              { label: "Total Admins",   value: adminUsers,    icon: ShieldAlert, color: "text-violet-600 bg-violet-50 border-violet-100" },
              { label: "Rejected",       value: rejectedUsers, icon: UserX,       color: "text-rose-600 bg-rose-50 border-rose-100"     },
              { label: "Approval Rate",  value: totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}%` : "0%", icon: Sparkle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.color} border shadow-inner`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{s.label}</span>
                  </div>
                  <span className="text-sm font-black text-slate-800">{s.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── User Management Table ── */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-sm overflow-hidden">
        {/* Table Header / Filter Toolbar */}
        <div className="p-6 border-b border-slate-100/80">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-800">User Management</h2>
              <p className="text-xs text-slate-400 mt-0.5">Showing {filteredUsers.length} of {totalUsers} registered users</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search users…"
                  className="pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 outline-none focus:border-violet-300 focus:bg-white focus:shadow-md transition-all w-48"
                />
              </div>
              {/* Filter */}
              <div className="relative">
                <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="pl-9 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 outline-none focus:border-violet-300 focus:bg-white transition-all appearance-none cursor-pointer w-32 relative font-bold"
                >
                  {FILTERS.map(f => <option key={f}>{f}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {/* Role Filter */}
              <div className="relative">
                <ShieldCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="pl-9 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 outline-none focus:border-violet-300 focus:bg-white transition-all appearance-none cursor-pointer w-32 relative font-bold"
                >
                  {ROLE_FILTERS.map(rf => <option key={rf}>{rf}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {/* Refresh */}
              <button
                onClick={fetchUsers}
                className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-500 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all cursor-pointer flex items-center justify-center"
                title="Refresh user database"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Table Grid View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center">
                        <Users size={24} className="text-slate-300 animate-bounce" />
                      </div>
                      <p className="text-sm font-semibold text-slate-400">No users found</p>
                      <p className="text-xs text-slate-300">{search ? "Try a different search query" : "No users match this filter badge"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const initials = (user.displayName || user.email || "?")
                    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* User Avatar & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.displayName || "User avatar"}
                              className="w-9 h-9 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-800 text-sm leading-tight">
                              {user.displayName || "—"}
                            </p>
                            {user.uid === currentUid && (
                              <span className="text-[9px] font-extrabold text-violet-500 uppercase tracking-wider mt-0.5 block">You</span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                          <Mail size={12} className="shrink-0 text-slate-400" />
                          <span className="truncate max-w-[180px]">{user.email || "—"}</span>
                        </div>
                      </td>
                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border ${user.role === "admin" ? "bg-violet-50 text-violet-700 border-violet-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          {user.role === "admin" ? <ShieldCheck size={10} /> : <Users size={10} />}
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      {/* Joined Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                          <Calendar size={12} className="shrink-0" />
                          {relativeDate(user.createdAt)}
                        </div>
                      </td>
                      {/* Action buttons */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <ActionMenu user={user} onAction={handleAction} currentUserUid={currentUid} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100/80 bg-slate-50/40">
            <p className="text-xs text-slate-400 font-semibold flex items-center gap-2">
              <Activity size={12} className="text-violet-400" />
              Showing {filteredUsers.length} of {totalUsers} registered members
              {filter !== "All" && ` • Status: ${filter}`}
              {roleFilter !== "All" && ` • Role: ${roleFilter}`}
            </p>
          </div>
        )}
      </div>

      {/* ── Add Admin Modal (Premium Glassmorphic Glass Drawer) ── */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => { if (!modalLoading) setIsAddAdminOpen(false); }}
          />

          {/* Glass Drawer Container */}
          <div className="bg-white/85 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-2xl w-full max-w-md p-6 relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddAdminOpen(false)}
              disabled={modalLoading}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all disabled:opacity-50 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100 shadow-inner">
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-none mb-1">Add Admin User</h3>
                <p className="text-xs text-slate-400">Promote an existing registered user to Admin</p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-start gap-2 leading-relaxed">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-sans pl-1">User's Registered Email</label>
                <div className="relative flex items-center rounded-2xl border border-white bg-white/40 overflow-hidden focus-within:border-violet-300 focus-within:bg-white/80 focus-within:shadow-md transition-all shadow-sm">
                  <Mail size={14} className="absolute left-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={e => setNewAdminEmail(e.target.value)}
                    placeholder="name@scholarsync.com"
                    className="w-full bg-transparent py-3.5 pl-11 pr-4 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400 font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={() => setIsAddAdminOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs transition-colors disabled:opacity-50 cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer font-sans"
                >
                  {modalLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus size={12} />
                      Promote to Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
