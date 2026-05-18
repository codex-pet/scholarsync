"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, ClipboardList, CheckSquare } from "lucide-react";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/components/Toast";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setTasks([]);
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubTasks = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort tasks: Active tasks first, then sorted by due date or creation date
      const sorted = tasksData.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });

      // Show a maximum of 5 tasks in the dashboard quicklist
      setTasks(sorted.slice(0, 5));
      setLoading(false);
    }, (error) => {
      console.error("Error loading dashboard tasks:", error);
      setLoading(false);
    });

    return () => unsubTasks();
  }, [user]);

  async function toggleTask(task) {
    const newStatus = !task.completed;
    try {
      await updateDoc(doc(db, "tasks", task.id), { completed: newStatus });
      if (newStatus) {
        toast.success("Task Completed!", `Great job finishing "${task.name}"!`);
      } else {
        toast.success("Task Re-activated", `"${task.name}" is back in active tasks.`);
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      toast.error("Failed to update task", err.message);
    }
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white/60 flex flex-col items-center justify-center min-h-[180px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs text-slate-400 font-semibold mt-3 animate-pulse">Loading today's tasks...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white/60 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 text-lg">Today&apos;s Tasks</h3>
          {totalCount > 0 && (
            <span className={`text-xs font-black px-3 py-1.5 rounded-xl border shadow-sm backdrop-blur-sm transition-all duration-300 ${
              completedCount === totalCount
                ? "bg-emerald-100/80 border-emerald-200 text-emerald-600 animate-bounce"
                : "bg-indigo-100/80 border-indigo-200 text-indigo-600"
            }`}>
              {completedCount}/{totalCount} completed
            </span>
          )}
        </div>

        {totalCount === 0 ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={22} className="text-indigo-400" />
            </div>
            <p className="font-bold text-slate-500 text-sm">All caught up! 🎉</p>
            <p className="text-xs text-slate-400 mt-1">No tasks logged. Tap below to add a new task.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task)}
                className="flex items-center gap-3.5 group/task cursor-pointer p-2 -mx-2 rounded-xl hover:bg-white/60 transition-all duration-200"
              >
                <div className="shrink-0 transition-transform duration-200 active:scale-90">
                  {task.completed ? (
                    <CheckCircle2 className="text-green-500 shadow-sm rounded-full bg-white/80" size={20} />
                  ) : (
                    <Circle className="text-slate-300 group-hover/task:text-indigo-500 group-hover/task:border-indigo-500 transition-colors" size={20} />
                  )}
                </div>
                <span className={`text-sm select-none break-words flex-1 leading-snug ${
                  task.completed 
                    ? 'text-slate-400 line-through font-medium' 
                    : 'text-slate-700 font-semibold group-hover/task:text-indigo-600 transition-colors'
                }`}>
                  {task.name}
                </span>
                
                {/* Due badge (if any) */}
                {task.due && !task.completed && (
                  <span className="text-[10px] font-bold text-slate-400 border border-slate-200/60 bg-slate-50/50 px-2 py-0.5 rounded-lg shrink-0">
                    {new Date(task.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        
        <Link 
          href="/tasks" 
          className="mt-6 pt-4 border-t border-slate-100/50 block text-xs font-black text-slate-400 hover:text-indigo-600 transition-all w-full text-center hover:translate-x-0.5 uppercase tracking-wider"
        >
          Manage All Tasks →
        </Link>
      </div>
    </div>
  );
}