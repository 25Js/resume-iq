import React, { useEffect, useState } from 'react';

const ScoreRing = ({ score = 0, size = 120, strokeWidth = 8, title = "" }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Determine color theme based on score thresholds
  const getColor = (val) => {
    if (val < 50) return 'stroke-rose-500';
    if (val < 75) return 'stroke-amber-500';
    if (val < 85) return 'stroke-indigo-500';
    return 'stroke-emerald-500';
  };

  const getTextColor = (val) => {
    if (val < 50) return 'text-rose-500';
    if (val < 75) return 'text-amber-500';
    if (val < 85) return 'text-indigo-500';
    return 'text-emerald-500';
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-full bg-secondary/30 blur-xs"></div>
        
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Base Background Track Circle */}
          <circle
            className="stroke-secondary"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress Circle */}
          <circle
            className={`transition-all duration-1000 ease-out ${getColor(animatedScore)}`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        {/* Central percentage text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tracking-tight ${getTextColor(animatedScore)}`}>
            {animatedScore}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Score
          </span>
        </div>
      </div>
      {title && (
        <h4 className="mt-3 text-sm font-semibold tracking-wide text-foreground/80">
          {title}
        </h4>
      )}
    </div>
  );
};

export default ScoreRing;
