"use client";
import { useEffect, useState } from "react";
import { Sun, Sunset, Moon, Lightbulb, CloudSnow } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const TIPS = [
  "Break your learning into 25-minute focus sessions for maximum retention.",
  "Review yesterday's notes before starting new material.",
  "Teaching a concept to yourself is the best way to master it.",
  "Use the Study Center to test yourself — active recall beats re-reading.",
  "Upload your files to the AI section for instant document-based Q&A.",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", Icon: Sun, color: "text-amber-400" };
  if (h < 17) return { text: "Good afternoon", Icon: Sunset, color: "text-orange-400" };
  return { text: "Good evening", Icon: Moon, color: "text-indigo-400" };
}

export default function Header() {
  const [greeting, setGreeting] = useState({ text: "Hello", Icon: Sun, color: "text-amber-400" });
  const [tip, setTip] = useState(TIPS[0]);
  const [date, setDate] = useState("");
  const [userName, setUserName] = useState("Scholar");

  function updateUserName() {
    const user = auth.currentUser;
    if (!user) return;

    // Prefer individually-saved firstName so multi-word first names show correctly
    const savedFirst = localStorage.getItem(`firstName_${user.uid}`);
    if (savedFirst !== null) {
      setUserName(savedFirst || "Scholar");
      return;
    }

    // Fallback: use first word of displayName or email prefix
    const name = user.displayName
      ? user.displayName.split(" ")[0]
      : (user.email?.split("@")[0] || "Scholar");
    setUserName(name);
  }

  useEffect(() => {
    setGreeting(getGreeting());
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    setDate(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) updateUserName();
    });

    window.addEventListener("profileUpdated", updateUserName);

    return () => {
      unsubscribe();
      window.removeEventListener("profileUpdated", updateUserName);
    };
  }, []);

  const { text, Icon, color } = greeting;

  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className={color} size={28} />
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">{text}, {userName}!</h1>
        </div>
        <p className="text-slate-400 font-medium ml-1">{date}</p>
        <div className="mt-5 flex items-center gap-3 bg-white/40 border border-white/60 px-5 py-2.5 rounded-full w-fit shadow-sm">
          <Lightbulb size={16} className="text-amber-400 shrink-0" />
          <p className="text-xs text-slate-500 font-medium italic">{tip}</p>
        </div>
      </div>
    </div>
  );
}