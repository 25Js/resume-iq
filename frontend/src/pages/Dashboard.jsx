import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Percent,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Upload,
  Calendar,
  Trash2
} from 'lucide-react';
import API from '../services/api';
import Loader, { Skeleton } from '../components/Loader';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const dashboardRes = await API.get('/resume/dashboard');
      setData(dashboardRes.data);
      
      const historyRes = await API.get('/resume/history');
      setHistory(historyRes.data.slice(0, 5)); // top 5 recent resumes
    } catch (err) {
      setError('Failed to fetch dashboard analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this resume and all its analyses?')) {
      try {
        await API.delete(`/resume/${id}`);
        fetchDashboardData();
      } catch (err) {
        alert('Failed to delete resume.');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-60" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Resumes',
      value: data?.totalResumesUploaded || 0,
      icon: FileText,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      description: 'Uploaded resumes in database'
    },
    {
      title: 'Average Score',
      value: `${data?.averageResumeScore || 0}%`,
      icon: Percent,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      description: 'Overall strength of candidates'
    },
    {
      title: 'Latest ATS Score',
      value: data?.latestAtsScore ? `${data.latestAtsScore}%` : 'N/A',
      icon: CheckCircle,
      color: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      description: 'ATS keywords & layout score'
    },
    {
      title: 'Job Match Score',
      value: data?.latestJobMatchScore ? `${data.latestJobMatchScore}%` : 'N/A',
      icon: TrendingUp,
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      description: 'Target Job Description match'
    }
  ];

  const chartColors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Welcome banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-primary to-accent border border-primary/20 text-primary-foreground overflow-hidden shadow-xl shadow-primary/10">
        {/* Glow Spheres */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-white/10 rounded-full blur-2xl -z-10 animate-pulse"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold w-fit">
              <Sparkles className="h-3.5 w-3.5 fill-white" />
              <span>ResumeIQ Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Boost Your Job Applications</h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Upload your resume to receive AI feedback, perform ATS checker compatibility scans, analyze skill gaps, and prepare for target mock interviews.
            </p>
          </div>
          <Link
            to="/upload"
            className="flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl bg-white text-primary hover:bg-white/95 font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Resume</span>
          </Link>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {card.value}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1.5 font-medium leading-normal">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* No resumes view */}
      {data?.totalResumesUploaded === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-card border border-border">
          <div className="p-5 bg-secondary/80 rounded-2xl border border-border text-muted-foreground mb-4">
            <FileText className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No Resumes Found</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Please upload a resume first to populate the dashboard statistics and start receiving AI career evaluations.
          </p>
          <Link
            to="/upload"
            className="mt-6 flex items-center space-x-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Resume Now</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score History Chart */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
                <h4 className="text-sm font-bold text-foreground tracking-wider uppercase">
                  Resume Score Trend
                </h4>
                <div className="flex items-center space-x-1 text-xs text-primary font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  <span>Improvement History</span>
                </div>
              </div>
              <div className="h-72 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.scoreHistory || []} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.3)" />
                    <XAxis
                      dataKey="uploadDate"
                      stroke="#888888"
                      fontSize={10}
                      tickFormatter={(dateStr) => {
                        const date = new Date(dateStr);
                        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis stroke="#888888" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(var(--card), 0.95)',
                        border: '1px solid rgb(var(--border))',
                        borderRadius: '12px',
                        color: 'rgb(var(--foreground))'
                      }}
                      labelFormatter={(dateStr) => {
                        return new Date(dateStr).toLocaleString();
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="resumeScore"
                      name="Resume Score"
                      stroke="#6366f1"
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="atsScore"
                      name="ATS Score"
                      stroke="#ec4899"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skill Distribution */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
                <h4 className="text-sm font-bold text-foreground tracking-wider uppercase">
                  Skill Frequency
                </h4>
              </div>
              <div className="h-72 w-full mt-2">
                {data?.skillDistribution?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center">
                    No skills identified in profile.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.skillDistribution || []} layout="vertical" margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.3)" horizontal={false} />
                      <XAxis type="number" stroke="#888888" fontSize={10} allowDecimals={false} />
                      <YAxis dataKey="skillName" type="category" stroke="#888888" fontSize={10} width={80} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(var(--card), 0.95)',
                          border: '1px solid rgb(var(--border))',
                          borderRadius: '12px',
                          color: 'rgb(var(--foreground))'
                        }}
                      />
                      <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12}>
                        {data?.skillDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Recent Uploads List */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <h4 className="text-sm font-bold text-foreground tracking-wider uppercase">
                Recent Resumes
              </h4>
              <Link to="/upload" className="flex items-center space-x-1 text-xs text-primary font-semibold hover:underline">
                <span>View all</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-bold text-muted-foreground uppercase">
                    <th className="pb-3 font-semibold">Resume Name</th>
                    <th className="pb-3 font-semibold">Upload Date</th>
                    <th className="pb-3 font-semibold">Candidate Email</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {history.map((resume) => (
                    <tr key={resume.id} className="hover:bg-secondary/20 transition-colors text-sm group">
                      <td className="py-4 font-semibold text-foreground flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="truncate max-w-[200px] sm:max-w-xs">{resume.filename}</span>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-4 w-4 text-muted-foreground/60" />
                          <span>{new Date(resume.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground truncate max-w-[150px]">
                        {resume.profile?.email || 'N/A'}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/analysis?resumeId=${resume.id}`}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                            title="View AI Report"
                          >
                            <ArrowUpRight className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={(e) => handleDelete(resume.id, e)}
                            type="button"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
