import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  ShieldCheck,
  FileSearch,
  MessageSquare,
  Compass,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload Resume', icon: Upload },
    { to: '/analysis', label: 'AI Resume Score', icon: BarChart3 },
    { to: '/ats-checker', label: 'ATS Checker', icon: ShieldCheck },
    { to: '/job-match', label: 'Job Match Analyzer', icon: FileSearch },
    { to: '/interview-prep', label: 'Interview Questions', icon: MessageSquare },
    { to: '/career-advisor', label: 'Career Advisor', icon: Compass },
    { to: '/profile', label: 'User Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-border bg-card/60 backdrop-blur-lg transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <NavLink to="/dashboard" className="flex items-center space-x-2 text-foreground hover:opacity-95">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                <Sparkles className="h-5 w-5 fill-primary-foreground" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ResumeIQ
              </span>
            </NavLink>
          </div>

          {/* User Widget */}
          <div className="p-4 mx-4 my-3 rounded-2xl bg-secondary/40 border border-border/60 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || 'email@resumeiq.com'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[0.98]'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={logout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 active:scale-95 transition-all duration-200 focus:outline-none"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
