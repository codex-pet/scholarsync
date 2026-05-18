"use client";
import { useEffect, useState } from "react";
import { loadStudySetsLocally } from "../lib/indexeddb";

export default function ProgressRing() {
  const [percentage, setPercentage] = useState(0);
  const [label, setLabel] = useState("No quizzes yet");

  useEffect(() => {
    loadStudySetsLocally()
      .then(sets => {
        const withMastery = sets.filter(s => s.mastery !== undefined);
        if (withMastery.length === 0) {
          setPercentage(0);
          setLabel("Take a quiz to track mastery");
          return;
        }
        const avg = Math.round(withMastery.reduce((a, s) => a + s.mastery, 0) / withMastery.length);
        setPercentage(avg);
        setLabel(avg >= 80 ? "Excellent mastery! 🎉" : avg >= 50 ? "Keep going! 💪" : "Just getting started 🌱");
      })
      .catch(() => setPercentage(0));
  }, []);

  const radius = 70;
  const stroke = 11;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#f59e0b" : "#6366f1";

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle stroke="white" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} className="opacity-30" />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black text-slate-800">{percentage}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery</span>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="font-bold text-slate-700">Avg Quiz Mastery</p>
        <p className="text-xs text-slate-400 mt-1 italic">{label}</p>
      </div>
    </div>
  );
}