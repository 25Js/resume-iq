import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, MessageSquare, ChevronDown, ChevronUp, AlertCircle, HelpCircle } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';

const InterviewQuestions = () => {
  const [searchParams] = useSearchParams();
  const [resumeId, setResumeId] = useState(searchParams.get('resumeId') || '');
  const [resumes, setResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState(null);
  const [activeTab, setActiveTab] = useState('technical');
  const [expandedIndex, setExpandedIndex] = useState(null);
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!resumeId || !jobDescription.trim()) return;

    setLoading(true);
    setError('');
    setQuestions(null);
    setExpandedIndex(null);

    try {
      const res = await API.post(`/ai/interview-questions?resumeId=${resumeId}`, { jobDescription });
      setQuestions(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to generate interview questions. Verify backend connections.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getActiveList = () => {
    if (!questions) return [];
    switch (activeTab) {
      case 'hr': return questions.hrQuestions || [];
      case 'technical': return questions.technicalQuestions || [];
      case 'project': return questions.projectQuestions || [];
      case 'behavioral': return questions.behavioralQuestions || [];
      default: return [];
    }
  };

  if (fetchingResumes) {
    return (
      <div className="p-6">
        <Loader message="Loading resumes..." />
      </div>
    );
  }

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const tabs = [
    { id: 'technical', label: 'Technical' },
    { id: 'project', label: 'Project-Based' },
    { id: 'behavioral', label: 'Behavioral' },
    { id: 'hr', label: 'HR & Cultural' }
  ];

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Input panel */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-5">
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
                    setQuestions(null);
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
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="block w-full px-4 py-3 rounded-2xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 text-sm mt-1"
              placeholder="Paste target job descriptions to contextually link interview mock prep queries..."
            />
          </div>

          {resumes.length > 0 && (
            <button
              type="submit"
              disabled={loading || !jobDescription.trim()}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/10 active:scale-95 disabled:opacity-50 transition-all duration-200 focus:outline-none"
            >
              <Sparkles className="h-5 w-5 fill-primary-foreground" />
              <span>Generate Personalized Mock Questions</span>
            </button>
          )}
        </form>
      </div>

      {loading && (
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm text-center">
          <Loader message="Gemini AI is reading project references and matching JD requirements to generate mock questions..." />
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-rose-500 bg-rose-500/10 border border-rose-500/20 px-5 py-3 rounded-2xl text-sm font-medium animate-slide-up">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Accordion Questions Block */}
      {questions && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6 animate-scale-up">
          {/* Tabs header */}
          <div className="flex border-b border-border overflow-x-auto gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setExpandedIndex(null);
                }}
                className={`py-3 px-4 font-bold text-xs tracking-wider uppercase border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-primary text-primary scale-[1.02]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Accordion Lists */}
          <div className="space-y-4">
            {getActiveList().map((question, i) => {
              const isExpanded = expandedIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border/80 bg-secondary/20 hover:border-primary/20 transition-colors"
                >
                  <button
                    onClick={() => toggleExpand(i)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-foreground focus:outline-none"
                  >
                    <div className="flex items-center space-x-2.5">
                      <HelpCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                      <span>{question}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-border bg-card/60 text-xs leading-relaxed text-foreground/80 space-y-2 animate-slide-up">
                      <div className="font-bold text-[10px] uppercase tracking-wider text-primary">AI Answer Guide Tip:</div>
                      <p>
                        To answer this questions, describe your experience using the STAR method (Situation, Task, Action, Result). Highlight specific tools mentioned in your projects. Talk about architectural trade-offs (e.g., choosing MongoDB for speed and scaling vs Relational DBs for consistency).
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {getActiveList().length === 0 && (
              <div className="text-center py-6 text-muted-foreground italic text-xs">
                No questions generated under this category.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewQuestions;
