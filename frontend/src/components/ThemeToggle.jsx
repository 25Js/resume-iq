import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-400 animate-[spin_10s_linear_infinite]" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-600 transition-transform duration-300 rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
