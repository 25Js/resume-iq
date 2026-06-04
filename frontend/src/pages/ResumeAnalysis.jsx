import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertTriangle, Eye, ShieldAlert, Award, FileSpreadsheet, ArrowRight } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import ScoreRing from '../components/ScoreRing';

const ResumeAnalysis = () => {
  const [searchParams] = useSearchParams();
  const [resumeId, setResumeId] = useState(searchParams.get('resumeId') || '');
  const [resumes, setResumes] = useState([]);
  const [analysis, setAnalysis] = useState(null);
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

  const handleAnalyze = async () => {
    if (!resumeId) return;

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const res = await API.post(`/ai/analyze-resume?resumeId=${resumeId}`);
      setAnalysis(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'AI Analysis failed. Make sure your API key is active.'
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
      {/* Resume Selector */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Resume to Analyze</label>
          {resumes.length === 0 ? (
            <p className="text-sm text-rose-500 font-semibold">No resumes found. Please upload a resume first.</p>
          ) : (
            <select
              value={resumeId}
              onChange={(e) => {
                setResumeId(e.target.value);
                setAnalysis(null);
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
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/10 active:scale-95 disabled:opacity-50 transition-all duration-200 focus:outline-none"
          >
            <Sparkles className="h-5 w-5 fill-primary-foreground" />
            <span>Generate AI Scorecard</span>
          </button>
        )}

        {resumes.length === 0 && (
          <Link
            to="/upload"
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg transition-transform hover:scale-[1.02]"
          >
            <span>Upload Resume</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {loading && (
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm text-center">
          <Loader message="Gemini AI is examining your resume structure, text, and keyword density..." />
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-rose-500 bg-rose-500/10 border border-rose-500/20 px-5 py-3 rounded-2xl text-sm font-medium animate-slide-up">
          <ShieldAlert className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Content */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-scale-up">
          {/* Left panel: Score ring & Quick Overview */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col items-center justify-center space-y-6 text-center lg:sticky lg:top-20">
            <h3 className="text-lg font-bold text-foreground">Resume Scorecard</h3>
            <ScoreRing score={analysis.score} size={150} strokeWidth={10} />
            <div className="text-sm text-muted-foreground leading-relaxed px-2">
              Based on keyword optimization, formatting standards, and structural content completeness, your resume has scored a <strong>{analysis.score}/100</strong>.
            </div>
            
            <div className="w-full pt-4 border-t border-border flex flex-col space-y-2">
              <Link
                to={`/ats-checker?resumeId=${resumeId}`}
                className="w-full py-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold tracking-wide transition-all uppercase"
              >
                Scan ATS Layout
              </Link>
              <Link
                to={`/job-match?resumeId=${resumeId}`}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold tracking-wide transition-all uppercase shadow-md shadow-primary/10"
              >
                Compare against job description
              </Link>
            </div>
          </div>

          {/* Right panel: Details List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-5 rounded-2xl bg-card border border-emerald-500/10 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-emerald-500 border-b border-emerald-500/10 pb-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <h4 className="font-bold text-sm tracking-wider uppercase text-foreground">Key Strengths</h4>
                </div>
                <ul className="space-y-2.5">
                  {analysis.strengths?.map((str, i) => (
                    <li key={i} className="text-xs text-foreground/85 flex items-start space-x-2 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                      <span>{str}</span>
                    </li>
                  ))}
                  {(!analysis.strengths || analysis.strengths.length === 0) && (
                    <li className="text-xs italic text-muted-foreground">No strengths recorded.</li>
                  )}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-5 rounded-2xl bg-card border border-rose-500/10 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-rose-500 border-b border-rose-500/10 pb-2">
                  <ShieldAlert className="h-5 w-5" />
                  <h4 className="font-bold text-sm tracking-wider uppercase text-foreground">Areas of Improvement</h4>
                </div>
                <ul className="space-y-2.5">
                  {analysis.weaknesses?.map((weak, i) => (
                    <li key={i} className="text-xs text-foreground/85 flex items-start space-x-2 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                      <span>{weak}</span>
                    </li>
                  ))}
                  {(!analysis.weaknesses || analysis.weaknesses.length === 0) && (
                    <li className="text-xs italic text-muted-foreground">No weaknesses recorded.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Formatting & ATS Recommendations */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-indigo-500 border-b border-border pb-3">
                <Award className="h-5 w-5" />
                <h4 className="font-bold text-sm tracking-wider uppercase text-foreground font-semibold">ATS & Formatting Optimisations</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Missing Sections */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Missing Sections</span>
                  </span>
                  <ul className="space-y-1.5 pl-1.5">
                    {analysis.missingSections?.map((sec, i) => (
                      <li key={i} className="text-xs font-semibold text-foreground/80 bg-secondary/60 border border-border/60 px-2.5 py-1.5 rounded-xl w-fit">
                        {sec}
                      </li>
                    ))}
                    {(!analysis.missingSections || analysis.missingSections.length === 0) && (
                      <li className="text-xs italic text-muted-foreground">None identified as missing.</li>
                    )}
                  </ul>
                </div>

                {/* Formatting Suggestions */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                    <Eye className="h-4 w-4 text-indigo-400" />
                    <span>Formatting Checks</span>
                  </span>
                  <ul className="space-y-2 pl-1.5 text-xs text-foreground/80">
                    {analysis.formattingSuggestions?.map((sug, i) => <li key={i}>• {sug}</li>)}
                    {(!analysis.formattingSuggestions || analysis.formattingSuggestions.length === 0) && (
                      <li className="text-xs italic text-muted-foreground">Formatting is compliant.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* ATS Recommendations */}
              <div className="pt-4 border-t border-border space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-pink-400" />
                  <span>Keyword Optimization Recommendations</span>
                </span>
                <ul className="space-y-2 text-xs text-foreground/80">
                  {analysis.atsRecommendations?.map((rec, i) => <li key={i}>• {rec}</li>)}
                </ul>
              </div>
            </div>

            {/* Improvement Tips */}
            <div className="p-6 rounded-2xl bg-card border border-primary/20 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-primary border-b border-border pb-3">
                <Sparkles className="h-5 w-5 fill-primary" />
                <h4 className="font-bold text-sm tracking-wider uppercase text-foreground">Actionable Improvement Tips</h4>
              </div>
              <ul className="space-y-3">
                {analysis.improvementTips?.map((tip, i) => (
                  <li key={i} className="text-xs text-foreground/85 flex items-start space-x-2 leading-relaxed bg-secondary/40 border border-border/40 p-3 rounded-xl">
                    <span className="text-primary font-bold mr-1">#{i + 1}</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysis;
