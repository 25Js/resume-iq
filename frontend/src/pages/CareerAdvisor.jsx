import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Compass, AlertCircle, Bookmark, Compass as CompassIcon, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';

const CareerAdvisor = () => {
  const [searchParams] = useSearchParams();
  const [resumeId, setResumeId] = useState(searchParams.get('resumeId') || '');
  const [resumes, setResumes] = useState([]);
  const [advice, setAdvice] = useState(null);
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

  const handleAdvise = async () => {
    if (!resumeId) return;

    setLoading(true);
    setError('');
    setAdvice(null);

    try {
      const res = await API.post(`/ai/career-advice?resumeId=${resumeId}`);
      setAdvice(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'AI Career advice retrieval failed. Verify Gemini connections.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingResumes) {
    return (
      <div className="p-6">
        <Loader message="Loading resumes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Selector panel */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Resume Profile</label>
          {resumes.length === 0 ? (
            <p className="text-sm text-rose-500 font-semibold">No resumes found. Please upload a resume first.</p>
          ) : (
            <select
              value={resumeId}
              onChange={(e) => {
                setResumeId(e.target.value);
                setAdvice(null);
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
            onClick={handleAdvise}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg active:scale-95 disabled:opacity-50 transition-all duration-200 focus:outline-none"
          >
            <Compass className="h-5 w-5" />
            <span>Generate Career Pathway</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm text-center">
          <Loader message="Gemini AI is analyzing your historical roles, projects, and target profiles to map learning paths..." />
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-rose-500 bg-rose-500/10 border border-rose-500/20 px-5 py-3 rounded-2xl text-sm font-medium animate-slide-up">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Career Pathway Results */}
      {advice && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-scale-up">
          {/* Roles & Suggestions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Suitable Roles */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-indigo-500 border-b border-border pb-2.5">
                <Bookmark className="h-5 w-5" />
                <h4 className="font-bold text-sm tracking-wider uppercase text-foreground">Recommended Roles</h4>
              </div>
              <div className="flex flex-col space-y-2">
                {advice.suitableRoles?.map((role, i) => (
                  <span key={i} className="px-3 py-2 bg-secondary/60 border border-border/80 text-xs font-semibold text-foreground rounded-xl">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-accent border-b border-border pb-2.5">
                <Sparkles className="h-5 w-5 fill-accent" />
                <h4 className="font-bold text-sm tracking-wider uppercase text-foreground">Career Advice</h4>
              </div>
              <ul className="space-y-2">
                {advice.careerSuggestions?.map((suggestion, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start space-x-2 leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0"></span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Timeline Learning Roadmap */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            <div className="flex items-center space-x-2 text-primary border-b border-border pb-3.5">
              <BookOpen className="h-5 w-5" />
              <h4 className="font-bold text-sm tracking-wider uppercase text-foreground">Personalised Learning Plan</h4>
            </div>

            <div className="relative border-l-2 border-border pl-6 ml-3 space-y-8">
              {advice.learningPlan?.map((plan, i) => (
                <div key={i} className="relative">
                  {/* Circle dot on left side */}
                  <span className="absolute -left-[33px] top-0.5 h-4.5 w-4.5 rounded-full border-2 border-primary bg-card flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                  </span>

                  <div className="space-y-2">
                    <h5 className="text-sm font-extrabold text-foreground tracking-tight">{plan.timeframe}</h5>
                    
                    <div className="text-xs text-muted-foreground">Topics to Learn:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.topics?.map((topic, j) => (
                        <span key={j} className="px-2.5 py-1 bg-secondary text-[11px] font-medium text-foreground rounded-lg border border-border">
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">Recommended Resources:</div>
                    <div className="flex flex-wrap gap-2 text-xs text-primary font-semibold">
                      {plan.resources?.map((res, j) => (
                        <span key={j} className="flex items-center space-x-1 hover:underline">
                          <CompassIcon className="h-3.5 w-3.5" />
                          <span>{res}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerAdvisor;
