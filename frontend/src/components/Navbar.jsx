import React from 'react';
import { Menu, User, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/upload': return 'Upload Resume';
      case '/analysis': return 'AI Resume Score';
      case '/ats-checker': return 'ATS Compatibility Checker';
      case '/job-match': return 'Job Match Analyzer';
      case '/interview-prep': return 'Mock Interview Prep';
      case '/career-advisor': return 'AI Career Advisor';
      case '/profile': return 'User Profile';
      default: return 'ResumeIQ';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/60 backdrop-blur-lg flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          type="button"
          className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold tracking-tight text-foreground lg:text-xl">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Quick AI status indicator */}
        <div className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-500">
          <Sparkles className="h-3 w-3 fill-emerald-500" />
          <span>Gemini AI Connected</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Info avatar */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-border">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="hidden md:block text-sm font-semibold text-foreground truncate max-w-[120px]">
            {user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
