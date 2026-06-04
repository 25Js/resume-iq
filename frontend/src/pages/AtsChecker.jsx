import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, CheckCircle2, Layout, Search, BookOpen, AlertCircle } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import ScoreRing from '../components/ScoreRing';

const AtsChecker = () => {
  const [searchParams] = useSearchParams();
  const [resumeId, setResumeId] = useState(searchParams.get('resumeId') || '');
  const [resumes, setResumes] = useState([]);
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

  const handleScan = async () => {
    if (!resumeId) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await API.post(`/ai/ats-check?resumeId=${resumeId}`);
      setResults(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'ATS evaluation failed. Ensure GEMINI_API_KEY is configured on the backend.'
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

  const getProgressColor = (score) => {
    if (score < 50) return 'bg-rose-500';
    if (score < 75) return 'bg-amber-500';
    if (score < 85) return 'bg-indigo-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Selector panel */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Resume to Verify</label>
          {resumes.length === 0 ? (
            <p className="text-sm text-rose-500 font-semibold">No resumes found. Please upload a resume first.</p>
          ) : (
            <select
              value={resumeId}
              onChange={(e) => {
                setResumeId(e.target.value);
                setResults(null);
                setError('');
              }}
              className="block w-full md:w-80 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 mt-1 font-semibold text-sm"
            >
              {resumes.map((res) => (
                <option key={res.id} value={res.id}>{res.filename}</option>
              ))}
            </select>
          )}
        </div>

        {resumes.length > 0 && (
          <button
            onClick={handleScan}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg active:scale-95 disabled:opacity-50 transition-all duration-200 focus:outline-none"
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Scan ATS Compliance</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm text-center">
          <Loader message="Gemini AI is parsing the layout tree, identifying font types, and grading semantic sections..." />
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-rose-500 bg-rose-500/10 border border-rose-500/20 px-5 py-3 rounded-2xl text-sm font-medium animate-slide-up">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-scale-up">
          {/* Circular Score */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col items-center justify-center space-y-6 text-center lg:sticky lg:top-20">
            <h3 className="text-lg font-bold text-foreground">ATS Score</h3>
            <ScoreRing score={results.atsScore} size={150} strokeWidth={10} />
            <div className="text-sm text-muted-foreground leading-relaxed px-2">
              Your overall ATS compliance rating is <strong>{results.atsScore}%</strong>. High-scoring resumes format standard headers and utilize key industry vocabularies.
            </div>
          </div>

          {/* Breakdown and Feedback */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Score Breakdown */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
              <h4 className="font-bold text-sm tracking-wider uppercase text-foreground border-b border-border/60 pb-2.5">
                ATS Component Grades
              </h4>

              <div className="space-y-4">
                {/* Structure Score */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center space-x-1.5">
                      <Layout className="h-4 w-4 text-indigo-400" />
                      <span>Layout & Structure</span>
                    </span>
                    <span>{results.structureScore}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(results.structureScore)}`}
                      style={{ width: `${results.structureScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Keyword Score */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center space-x-1.5">
                      <Search className="h-4 w-4 text-pink-400" />
                      <span>Keyword Density</span>
                    </span>
                    <span>{results.keywordScore}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(results.keywordScore)}`}
                      style={{ width: `${results.keywordScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Completeness Score */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center space-x-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Section Completeness</span>
                    </span>
                    <span>{results.completenessScore}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(results.completenessScore)}`}
                      style={{ width: `${results.completenessScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Readability Score */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center space-x-1.5">
                      <BookOpen className="h-4 w-4 text-amber-400" />
                      <span>Linguistic Readability</span>
                    </span>
                    <span>{results.readabilityScore}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(results.readabilityScore)}`}
                      style={{ width: `${results.readabilityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ATS Feedback Bullet Points */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-primary border-b border-border pb-3">
                <Sparkles className="h-5 w-5 fill-primary" />
                <h4 className="font-bold text-sm tracking-wider uppercase text-foreground">ATS Parser Recommendations</h4>
              </div>
              <ul className="space-y-3">
                {results.feedback?.map((fb, i) => (
                  <li key={i} className="text-xs text-foreground/85 flex items-start space-x-2.5 leading-relaxed bg-secondary/40 border border-border/40 p-3 rounded-xl">
                    <span className="text-indigo-500 font-bold">#{i + 1}</span>
                    <span>{fb}</span>
                  </li>
                ))}
                {(!results.feedback || results.feedback.length === 0) && (
                  <li className="text-xs italic text-muted-foreground text-center py-4">No recommendations. Your resume layout is optimal!</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtsChecker;
