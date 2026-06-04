import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, FileText, CheckCircle, AlertCircle, Bookmark, Compass } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import ScoreRing from '../components/ScoreRing';

const JobMatch = () => {
  const [searchParams] = useSearchParams();
  const [resumeId, setResumeId] = useState(searchParams.get('resumeId') || '');
  const [resumes, setResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingResumes, setFetchingResumes] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const res = await API.get('/resume/history');
        setResumes(res.data);
        if (!resumeId && res.data.length > 0) {
          setResumeId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to fetch resumes:', err);
      } finally {
        setFetchingResumes(false);
      }
    };
    loadResumes();
  }, [resumeId]);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!resumeId || !jobDescription.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await API.post(`/ai/job-match?resumeId=${resumeId}`, { jobDescription });
      setResults(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Job matching failed. Check your connection or API key.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingResumes) {
    return (
      <div className="p-6">
        <Loader message="Loading resume records..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Input Form Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        <form onSubmit={handleMatch} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Resume</label>
              {resumes.length === 0 ? (
                <p className="text-sm text-rose-500 font-semibold mt-1">No resumes found. Please upload a resume first.</p>
              ) : (
                <select
                  value={resumeId}
                  onChange={(e) => {
                    setResumeId(e.target.value);
                    setResults(null);
                    setError('');
                  }}
                  className="block w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 mt-1 font-semibold text-sm"
                >
                  {resumes.map((res) => (
                    <option key={res.id} value={res.id}>{res.filename}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paste Target Job Description</label>
            <textarea
              required
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="block w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 text-sm mt-1"
              placeholder="Paste the details of the job listing you want to target (roles, skills, and qualifications)..."
            />
          </div>

          {resumes.length > 0 && (
            <button
              type="submit"
              disabled={loading || !jobDescription.trim()}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/10 active:scale-95 disabled:opacity-50 transition-all duration-200 focus:outline-none"
            >
              <Sparkles className="h-5 w-5 fill-primary-foreground" />
              <span>Calculate Match Score</span>
            </button>
          )}
        </form>
      </div>

      {loading && (
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm text-center">
          <Loader message="Gemini AI is cross-referencing keywords, comparing job competencies, and calculating compatibility scores..." />
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-rose-500 bg-rose-500/10 border border-rose-500/20 px-5 py-3 rounded-2xl text-sm font-medium animate-slide-up">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Match Results */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-scale-up">
          {/* Ring Score */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col items-center justify-center space-y-6 text-center lg:sticky lg:top-20">
            <h3 className="text-lg font-bold text-foreground">Match Compatibility</h3>
            <ScoreRing score={results.matchScore} size={150} strokeWidth={10} />
            <div className="text-sm text-muted-foreground leading-relaxed px-2">
              Your resume matches <strong>{results.matchScore}%</strong> of the skills and competencies required in the target Job Description.
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Side-by-side Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Extracted Skills */}
              <div className="p-5 rounded-2xl bg-card border border-emerald-500/10 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-emerald-500 border-b border-emerald-500/10 pb-2">
                  <CheckCircle className="h-4 w-4" />
                  <h4 className="font-bold text-sm tracking-wider uppercase text-foreground">Matched Skills</h4>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {results.extractedSkills?.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {skill}
                    </span>
                  ))}
                  {(!results.extractedSkills || results.extractedSkills.length === 0) && (
                    <span className="text-muted-foreground italic text-xs">No matching skills identified.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="p-5 rounded-2xl bg-card border border-rose-500/10 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-rose-500 border-b border-rose-500/10 pb-2">
                  <AlertCircle className="h-4 w-4" />
                  <h4 className="font-bold text-sm tracking-wider uppercase text-foreground">Missing Skills</h4>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {results.missingSkills?.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/5 border border-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-pulse">
                      {skill}
                    </span>
                  ))}
                  {(!results.missingSkills || results.missingSkills.length === 0) && (
                    <span className="text-emerald-500 font-semibold text-xs flex items-center space-x-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Perfect! No missing skills.</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Changes */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-primary border-b border-border pb-3">
                <Compass className="h-5 w-5" />
                <h4 className="font-bold text-sm tracking-wider uppercase text-foreground">Suggested Resume Revisions</h4>
              </div>
              <ul className="space-y-3">
                {results.recommendedChanges?.map((change, i) => (
                  <li key={i} className="text-xs text-foreground/85 flex items-start space-x-2.5 leading-relaxed bg-secondary/40 border border-border/40 p-3 rounded-xl">
                    <span className="text-primary font-bold">#{i + 1}</span>
                    <span>{change}</span>
                  </li>
                ))}
                {(!results.recommendedChanges || results.recommendedChanges.length === 0) && (
                  <li className="text-xs italic text-muted-foreground">No recommendations needed.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatch;
