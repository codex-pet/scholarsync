export default function ProgressRing({ percentage }) {
  const radius = 75;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="white"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="opacity-40"
          />
          <circle
            stroke="#4F46E5"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-black text-slate-800">{percentage}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complete</span>
        </div>
      </div>
      <div className="mt-10 text-center">
        <p className="font-bold text-slate-700">Today&apos;s Progress</p>
        <p className="text-xs text-slate-400 mt-1 italic">Keep going! You&apos;re doing great 🌱</p>
      </div>
    </div>
  );
}