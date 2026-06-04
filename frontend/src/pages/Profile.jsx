import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, Shield, Award, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/resume/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load profile dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 rounded-2xl bg-primary text-primary-foreground border border-primary/20 flex items-center justify-center font-extrabold text-3xl shadow-xl shadow-primary/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{user?.name || 'User Candidate'}</h3>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider mt-2">
              <Shield className="h-3 w-3" />
              <span>SaaS Candidate</span>
            </span>
          </div>

          <div className="w-full pt-4 border-t border-border/60 text-left text-xs space-y-3.5 text-foreground/80">
            <div className="flex items-center space-x-3.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">Email Address</span>
                <span className="font-semibold text-foreground">{user?.email || 'email@example.com'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">Member Since</span>
                <span className="font-semibold text-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'June 2026'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h4 className="text-lg font-bold text-foreground">Your Analytics Summary</h4>
            <p className="text-sm text-muted-foreground mt-0.5">Statistical indices for all optimization runs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">Uploaded Resumes</span>
                <span className="text-xl font-extrabold text-foreground">{stats?.totalResumesUploaded || 0}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">Avg Resume Score</span>
                <span className="text-xl font-extrabold text-foreground">{stats?.averageResumeScore || 0}%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/10">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">Latest ATS Score</span>
                <span className="text-xl font-extrabold text-foreground">{stats?.latestAtsScore || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
