"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle2, Circle, Clock, Plus, Calendar, Tag, AlertCircle, Trash2,
  Play, Pause, Square, ChevronRight, ChevronDown, ChevronUp, Pencil, Flag, X, Check, ListChecks
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useToast, ToastContainer } from "@/components/Toast";

const tagColors = {
  Reading: "bg-indigo-100 text-indigo-700",
  Assignment: "bg-orange-100 text-orange-700",
  Project: "bg-emerald-100 text-emerald-700",
  Study: "bg-pink-100 text-pink-700",
  Other: "bg-slate-200 text-slate-700"
};

const priorityColors = {
  High: "text-rose-600 bg-rose-100/80 border-rose-200",
  Medium: "text-amber-600 bg-amber-100/80 border-amber-200",
  Low: "text-blue-600 bg-blue-100/80 border-blue-200"
};

const priorityWeight = { High: 3, Medium: 2, Low: 1 };

function TaskNotes({ taskId, initialNotes }) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    if (notes === initialNotes) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "tasks", taskId), { notes });
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  }

  return (
    <div className="mt-4 pl-0 sm:pl-[48px] pr-2 pb-2 relative">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder="Add sub-tasks, links, or notes here..."
        className="w-full bg-white/50 backdrop-blur-sm border border-white/80 rounded-2xl p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white/80 min-h-[100px] resize-y placeholder:text-slate-400 shadow-inner transition-all"
      />
      {saving && <span className="absolute bottom-5 right-6 text-[10px] text-slate-400 font-bold uppercase">Saving...</span>}
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false); // Custom confirmation modal state
  const { toasts, toast, dismissToast } = useToast();

  // New Task State
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("Assignment");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");

  // UI State
  const [activeTab, setActiveTab] = useState("Active"); // "Active" | "Completed"
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  // Edit Task State
  const [editName, setEditName] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editPriority, setEditPriority] = useState("");

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('focus'); // 'focus' or 'break'

  useEffect(() => {
    setIsMounted(true);
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setTasks([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribeTasks = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });

    return () => unsubscribeTasks();
  }, [user]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.2); // C6
        
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch(e) {
        console.error("Audio error", e);
      }

      if (timerMode === 'focus') {
         setTimerMode('break');
         setTimeLeft(5 * 60);
      } else {
         setTimerMode('focus');
         setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60);
  };
  const switchTimerMode = (mode) => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  }
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  async function handleAddTask(e) {
    e.preventDefault();
    if (!newTaskName.trim() || !newTaskDue || !user) return;
    
    const taskData = {
      name: newTaskName,
      tag: newTaskTag,
      due: newTaskDue,
      priority: newTaskPriority,
      completed: false,
      notes: "",
      userId: user.uid,
      createdAt: serverTimestamp()
    };
    
    const originalName = newTaskName;
    setNewTaskName("");
    setNewTaskDue("");
    
    try {
      await addDoc(collection(db, "tasks"), taskData);
      setActiveTab("Active");
      toast.success("Task Created!", `Successfully added "${originalName}".`);
    } catch (err) {
      console.error("Error adding task:", err);
      toast.error("Add task failed", err.message);
    }
  }

  async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newStatus = !task.completed;
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: newStatus } : t));
    
    try {
      await updateDoc(doc(db, "tasks", id), { completed: newStatus });
      if (newStatus) {
        toast.success("Task Completed!", `Great job finishing "${task.name}"!`);
      } else {
        toast.success("Task Re-activated", `"${task.name}" is back in active tasks.`);
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: task.completed } : t));
      toast.error("Failed to update task", err.message);
    }
  }

  async function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    const previousTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));
    
    try {
      await deleteDoc(doc(db, "tasks", id));
      if (task) {
        toast.success("Task Deleted", `"${task.name}" has been removed.`);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      setTasks(previousTasks);
      toast.error("Failed to delete task", err.message);
    }
  }

  async function clearCompleted() {
    setClearConfirmOpen(true);
  }

  async function executeClearCompleted() {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) {
      setClearConfirmOpen(false);
      return;
    }
    
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => !t.completed));
    
    try {
      const batch = writeBatch(db);
      completedTasks.forEach(t => {
        const ref = doc(db, "tasks", t.id);
        batch.delete(ref);
      });
      await batch.commit();
      toast.success("Completed Tasks Cleared!", `Removed ${completedTasks.length} completed tasks.`);
    } catch (err) {
      console.error("Error clearing completed:", err);
      setTasks(originalTasks);
      toast.error("Failed to clear tasks", err.message);
    } finally {
      setClearConfirmOpen(false);
    }
  }

  function startEdit(t) {
    setEditingTaskId(t.id);
    setEditName(t.name);
    setEditTag(t.tag);
    setEditDue(t.due);
    setEditPriority(t.priority || "Medium");
    setExpandedTaskId(null);
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === id ? { ...t, name: editName, tag: editTag, due: editDue, priority: editPriority } : t));
    setEditingTaskId(null);
    try {
      await updateDoc(doc(db, "tasks", id), {
        name: editName,
        tag: editTag,
        due: editDue,
        priority: editPriority
      });
      toast.success("Task Updated", "Changes saved successfully.");
    } catch (err) {
      console.error("Error saving edit:", err);
      setTasks(previousTasks);
      toast.error("Failed to update task", err.message);
    }
  }

  function getDaysUntil(dateString) {
    if (!dateString) return null;
    const due = new Date(dateString);
    due.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = due - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function formatDue(dateString) {
    const days = getDaysUntil(dateString);
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days === -1) return "Yesterday";
    if (days < -1) return `${Math.abs(days)} days ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const urgentTasks = tasks.filter(t => !t.completed && getDaysUntil(t.due) >= 0 && getDaysUntil(t.due) <= 2).sort((a, b) => new Date(a.due) - new Date(b.due));
  const overdueTasks = tasks.filter(t => !t.completed && getDaysUntil(t.due) < 0).sort((a, b) => new Date(a.due) - new Date(b.due));

  const filteredTasks = tasks.filter(t => {
    if (activeTab === "Active") return !t.completed;
    if (activeTab === "Overdue") return !t.completed && getDaysUntil(t.due) < 0;
    return t.completed;
  });
  
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (activeTab === 'Active' || activeTab === 'Overdue') {
      const pA = priorityWeight[a.priority || 'Medium'];
      const pB = priorityWeight[b.priority || 'Medium'];
      if (pB !== pA) return pB - pA;
      
      const dA = new Date(a.due).getTime();
      const dB = new Date(b.due).getTime();
      if (dA !== dB) return dA - dB;
    }
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });

  if (!isMounted) return null;
  if (loading && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-300">
      
      {/* 1. Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative z-50">
        <div>
          <h1 className="text-4xl text-slate-800 tracking-tight font-bold">Daily Tasks</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your academic schedule and deadlines</p>
        </div>
        <div className="flex items-stretch gap-3">
          <div className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl text-center border border-white/80 shadow-sm flex flex-col justify-center items-center min-w-[120px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-black text-indigo-600 leading-none mt-1.5">{completedCount}/{totalCount}</p>
          </div>
          
          <div className="group relative z-50 flex">
            <div className={`backdrop-blur-md px-6 py-3 rounded-2xl text-center border shadow-sm flex flex-col justify-center items-center transition-all min-w-[160px] max-w-[260px] ${
              overdueTasks.length > 0 || urgentTasks.length > 0
                ? 'bg-rose-50/90 border-rose-200 hover:bg-rose-100 cursor-help'
                : 'bg-emerald-50/90 border-emerald-200'
            }`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                 {overdueTasks.length > 0 || urgentTasks.length > 0 ? (
                   <AlertCircle size={16} className="text-rose-600 animate-pulse" />
                 ) : (
                   <CheckCircle2 size={16} className="text-emerald-500" />
                 )}
                 <p className={`text-[10px] font-bold uppercase tracking-widest ${
                   overdueTasks.length > 0 || urgentTasks.length > 0 ? 'text-rose-600' : 'text-emerald-600'
                 }`}>
                   {overdueTasks.length > 0 || urgentTasks.length > 0 ? 'Action Required' : 'All Clear'}
                 </p>
              </div>
              
              <div className="w-full">
                {overdueTasks.length > 0 || urgentTasks.length > 0 ? (
                  <>
                    <p className="text-sm font-black leading-tight text-rose-600 line-clamp-2 break-words" title={overdueTasks.length > 0 ? overdueTasks[0].name : urgentTasks[0].name}>
                      {overdueTasks.length > 0 ? overdueTasks[0].name : urgentTasks[0].name}
                    </p>
                    {overdueTasks.length + urgentTasks.length > 1 && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mt-1">
                        + {overdueTasks.length + urgentTasks.length - 1} MORE DUE
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-black leading-none text-emerald-600 mt-0.5">0</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 mt-1">DUE TASKS</p>
                  </>
                )}
              </div>
            </div>

            {(overdueTasks.length > 0 || urgentTasks.length > 0) && (
              <div className="absolute top-full right-0 mt-3 w-[320px] bg-white/95 backdrop-blur-xl border border-rose-200 rounded-3xl p-5 shadow-2xl shadow-rose-900/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:scale-100 scale-95 z-50 text-left">
                <div className="space-y-4">
                  {overdueTasks.length > 0 && (
                    <div className="bg-rose-50/80 border border-rose-100 rounded-2xl p-4">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse" /> Overdue
                      </h4>
                      <ul className="space-y-2">
                        {overdueTasks.map(t => (
                          <li key={t.id} className="text-sm font-semibold text-slate-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span className="leading-tight">{t.name}
                              <span className="text-[10px] text-rose-400 font-medium ml-1">({formatDue(t.due)})</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {urgentTasks.length > 0 && (
                    <div className="bg-orange-50/80 border border-orange-100 rounded-2xl p-4">
                      <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" /> Due Soon
                      </h4>
                      <ul className="space-y-2">
                        {urgentTasks.map(t => (
                          <li key={t.id} className="text-sm font-semibold text-slate-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                            <span className="leading-tight">{t.name} <span className="text-xs text-slate-400 font-medium ml-1">({formatDue(t.due)})</span></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        
        {/* 2. Main Task List (Left Side) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* New Task Input Bar */}
          <form onSubmit={handleAddTask} className="bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/80 shadow-lg shadow-indigo-100/30 flex flex-col gap-5 relative z-20 transition-all focus-within:shadow-indigo-200/40">
            <div className="flex items-center gap-4 border-b border-slate-200/50 pb-4">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-200 flex items-center justify-center bg-indigo-50/50 shrink-0">
                <Plus size={16} className="text-indigo-500" />
              </div>
              <input 
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="What's your next task?" 
                className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-bold text-lg" 
                required
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Priority Selector */}
                <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-white shadow-sm flex-1 sm:flex-none">
                  <Flag size={14} className={newTaskPriority === 'High' ? 'text-rose-500' : newTaskPriority === 'Medium' ? 'text-amber-500' : 'text-blue-500'} />
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="bg-transparent outline-none text-sm font-bold text-slate-600 cursor-pointer w-full"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-white shadow-sm flex-1 sm:flex-none">
                  <Tag size={14} className="text-indigo-400 shrink-0" />
                  <select 
                    value={newTaskTag}
                    onChange={(e) => setNewTaskTag(e.target.value)}
                    className="bg-transparent outline-none text-sm font-bold text-slate-600 cursor-pointer w-full"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                    <option value="Reading">Reading</option>
                    <option value="Study">Study</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-white shadow-sm flex-1 sm:flex-none">
                  <Calendar size={14} className="text-indigo-400 shrink-0" />
                  <input 
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="bg-transparent outline-none text-sm font-bold text-slate-600 cursor-pointer w-full"
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                Create Task
              </button>
            </div>
          </form>

          {/* Task List Section */}
          <div className="space-y-4">
            
            {/* Tabs & Clear Button */}
            <div className="flex items-center justify-between ml-2 mb-6">
              <div className="flex items-center gap-2 sm:gap-4 bg-white/40 p-1 rounded-2xl border border-white/60">
                 <button 
                   onClick={() => setActiveTab('Active')}
                   className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'Active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Active Tasks
                 </button>
                 <button 
                   onClick={() => setActiveTab('Overdue')}
                   className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'Overdue' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-rose-600'}`}
                 >
                   Overdue
                   {overdueTasks.length > 0 && (
                     <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${activeTab === 'Overdue' ? 'bg-white text-rose-500' : 'bg-rose-100 text-rose-600'}`}>
                       {overdueTasks.length}
                     </span>
                   )}
                 </button>
                 <button 
                   onClick={() => setActiveTab('Completed')}
                   className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'Completed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Completed
                 </button>
              </div>

              {activeTab === 'Completed' && completedCount > 0 && (
                 <button onClick={clearCompleted} className="text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
                    <Trash2 size={14} /> Clear All
                 </button>
              )}
            </div>

            {/* Task Items */}
            {sortedTasks.length === 0 ? (
              <div className="text-center py-12 bg-white/40 rounded-[2.5rem] border border-white/60 border-dashed">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <ListChecks className="text-indigo-300" size={32} />
                </div>
                <p className="text-slate-500 font-medium text-lg">
                  {activeTab === 'Active' ? "No active tasks right now. You're all caught up! 🎉" : "No completed tasks yet. Time to get to work!"}
                </p>
              </div>
            ) : (
              sortedTasks.map((t) => {
                const daysUntil = getDaysUntil(t.due);
                const isOverdue = !t.completed && daysUntil < 0;
                const isNear = !t.completed && daysUntil >= 0 && daysUntil <= 2;
                const p = t.priority || "Medium";

                // Edit Mode Rendering
                if (editingTaskId === t.id) {
                  return (
                    <div key={t.id} className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-indigo-200 shadow-lg shadow-indigo-100/50 space-y-4">
                      <input 
                        value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="w-full text-lg font-bold bg-transparent border-b border-indigo-100 pb-2 outline-none text-slate-800"
                        autoFocus
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 outline-none">
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                        <select value={editTag} onChange={(e) => setEditTag(e.target.value)} className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 outline-none">
                          <option value="Assignment">Assignment</option>
                          <option value="Project">Project</option>
                          <option value="Reading">Reading</option>
                          <option value="Study">Study</option>
                          <option value="Other">Other</option>
                        </select>
                        <input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 outline-none" />
                        <div className="flex items-center gap-2 ml-auto">
                          <button onClick={() => setEditingTaskId(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-xl transition-colors"><X size={18}/></button>
                          <button onClick={() => saveEdit(t.id)} className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors"><Check size={18}/></button>
                        </div>
                      </div>
                    </div>
                  )
                }

                // Normal Mode Rendering
                return (
                  <div key={t.id} className={`group bg-white/60 backdrop-blur-md p-5 sm:px-6 rounded-[2rem] flex flex-col transition-all duration-300 border hover:shadow-xl ${t.completed ? 'border-emerald-100/50 bg-emerald-50/30' : 'border-white/80 hover:shadow-indigo-100/40 hover:-translate-y-0.5'}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-5 overflow-hidden flex-1">
                        {/* Checkbox */}
                        <button onClick={() => toggleTask(t.id)} className="shrink-0 transition-colors focus:outline-none">
                          {t.completed ? (
                             <CheckCircle2 className="text-emerald-500" size={28} />
                          ) : (
                             <Circle className="text-slate-300 hover:text-indigo-500 transition-colors" size={28} />
                          )}
                        </button>
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-bold text-lg truncate transition-colors ${t.completed ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                              {t.name}
                            </p>
                            {!t.completed && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 border ${priorityColors[p]}`}>
                                <Flag size={10} /> {p}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className={`${tagColors[t.tag] || tagColors.Other} text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0`}>
                              <Tag size={10}/> {t.tag}
                            </span>
                            
                            {/* Due Date with Warning */}
                            <span className={`text-xs font-bold flex items-center gap-1.5 shrink-0 ${isOverdue ? 'text-rose-500' : isNear ? 'text-orange-500' : 'text-slate-500'}`}>
                              {isOverdue || isNear ? <AlertCircle size={14} /> : <Calendar size={14} className="opacity-70" />}
                              {formatDue(t.due)}
                              {isOverdue && <span className="text-[10px] uppercase bg-rose-100 px-1.5 rounded text-rose-600">Overdue</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                         <button 
                            onClick={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)} 
                            className={`p-2.5 rounded-xl transition-all focus:outline-none ${expandedTaskId === t.id ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                          >
                            {expandedTaskId === t.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                         </button>
                         {!t.completed && (
                           <button onClick={() => startEdit(t)} className="p-2.5 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-500 transition-all focus:outline-none hidden sm:block">
                              <Pencil size={18} />
                           </button>
                         )}
                         <button onClick={() => deleteTask(t.id)} className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all focus:outline-none">
                            <Trash2 size={18} />
                         </button>
                      </div>
                    </div>

                    {/* Notes / Sub-tasks Expansion */}
                    {expandedTaskId === t.id && (
                       <TaskNotes taskId={t.id} initialNotes={t.notes} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Analytics & Productivity (Right Side) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Task Insights Card */}
          <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/80 shadow-sm space-y-8 relative overflow-hidden group">
            <div className="absolute top-[-30%] right-[-10%] w-[200px] h-[200px] bg-indigo-400/20 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            
            <h3 className="text-xl font-bold text-slate-800 relative z-10">Task Insights</h3>
            
            <div className="space-y-6 relative z-10">
               <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Completion Rate</span>
                    <span className="text-sm font-black text-indigo-600">{progressPercent}%</span>
                  </div>
                 <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(129,140,248,0.5)]" 
                      style={{ width: `${progressPercent}%` }}
                    />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-white/90 shadow-sm flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending</p>
                    <p className="text-2xl font-black text-slate-800">{totalCount - completedCount}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-white/90 shadow-sm flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Overdue</p>
                    <p className={`text-2xl font-black ${overdueTasks.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{overdueTasks.length}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Pomodoro Focus Timer */}
          <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/80 shadow-sm space-y-6 relative overflow-hidden group">
            <h3 className="text-xl font-bold text-slate-800 relative z-10 flex items-center gap-2">
              <Clock className="text-indigo-500" size={20} /> Focus Timer
            </h3>
            
            <p className="text-sm text-slate-500 font-medium">
              Use the Pomodoro technique to stay focused on your tasks without burning out.
            </p>

            <div className="flex bg-slate-100/50 p-1 rounded-2xl">
              <button 
                onClick={() => switchTimerMode('focus')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${timerMode === 'focus' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Focus (25m)
              </button>
              <button 
                onClick={() => switchTimerMode('break')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${timerMode === 'break' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Break (5m)
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <div className={`text-6xl font-black tracking-tighter tabular-nums ${timerMode === 'focus' ? 'text-slate-800' : 'text-emerald-600'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={toggleTimer} 
                className={`flex-1 py-4 rounded-2xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${isTimerRunning ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
              >
                {isTimerRunning ? <><Pause size={18}/> Pause</> : <><Play size={18}/> Start</>}
              </button>
              <button 
                onClick={resetTimer} 
                className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm flex items-center justify-center"
              >
                <Square size={18}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Premium Confirm Clear Completed Tasks Modal */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="bg-white border border-slate-100 rounded-[32px] max-w-md w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
              <Trash2 size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Clear Completed Tasks</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Are you sure you want to permanently clear all completed tasks from your list? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setClearConfirmOpen(false)}
                className="flex-1 py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeClearCompleted}
                className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-200"
              >
                Clear Tasks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}