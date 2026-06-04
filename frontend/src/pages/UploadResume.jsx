import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Trash2, ArrowUpRight, CheckCircle, BrainCircuit } from 'lucide-react';
import API from '../services/api';
import FileDropzone from '../components/FileDropzone';
import Loader from '../components/Loader';

const UploadResume = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parsedProfile, setParsedProfile] = useState(null);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const res = await API.get('/resume/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch resume history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileSelect = async (file) => {
    if (!file) {
      setParsedProfile(null);
      setError('');
      setSuccess('');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setParsedProfile(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Resume uploaded and parsed successfully!');
      setParsedProfile(res.data.profile);
      fetchHistory();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to parse the resume. Please ensure the file is not corrupted.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await API.delete(`/resume/${id}`);
        setSuccess('Resume deleted successfully.');
        setParsedProfile(null);
        fetchHistory();
      } catch (err) {
        setError('Failed to delete resume.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Upload Panel */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
        <div className="max-w-xl mx-auto text-center space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Upload Your Resume</h2>
          <p className="text-sm text-muted-foreground">
            We will extract the text, analyze it, and build a structured resume profile using Gemini AI.
          </p>
        </div>

        {!isLoading && <FileDropzone onFileSelect={handleFileSelect} />}

        {isLoading && (
          <div className="py-8 bg-secondary/20 rounded-2xl border border-border">
            <Loader message="Reading file content & parsing structured profile using Gemini AI..." />
          </div>
        )}

        {/* Action success alert */}
        {success && (
          <div className="max-w-xl mx-auto flex items-center space-x-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl text-sm font-medium animate-slide-up">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Action error alert */}
        {error && (
          <div className="max-w-xl mx-auto flex items-center space-x-2 text-rose-500 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-2xl text-sm font-medium animate-slide-up">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Parsed Profile Preview */}
        {parsedProfile && (
          <div className="max-w-3xl mx-auto mt-6 border border-border/80 rounded-2xl bg-secondary/20 p-5 space-y-5 animate-scale-up">
            <div className="flex items-center space-x-2 border-b border-border pb-3">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">AI Extracted Resume Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Candidate Name</span>
                <span className="font-semibold text-foreground mt-1 block">{parsedProfile.candidateName || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</span>
                <span className="font-semibold text-foreground mt-1 block">{parsedProfile.email || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</span>
                <span className="font-semibold text-foreground mt-1 block">{parsedProfile.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/60 text-sm">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Identified Skills</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {parsedProfile.skills?.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-card border border-border text-xs font-medium text-foreground shadow-xs">
                      {skill}
                    </span>
                  ))}
                  {(!parsedProfile.skills || parsedProfile.skills.length === 0) && (
                    <span className="text-muted-foreground italic text-xs">No skills identified.</span>
                  )}
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Education Summary</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-foreground/80 mt-1">
                  {parsedProfile.education?.map((edu, i) => <li key={i}>{edu}</li>)}
                  {(!parsedProfile.education || parsedProfile.education.length === 0) && (
                    <span className="text-muted-foreground italic text-xs">No education details.</span>
                  )}
                </ul>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Experience Summary</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-foreground/80 mt-1">
                  {parsedProfile.experience?.map((exp, i) => <li key={i}>{exp}</li>)}
                  {(!parsedProfile.experience || parsedProfile.experience.length === 0) && (
                    <span className="text-muted-foreground italic text-xs">No experience details.</span>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        <div className="border-b border-border pb-4 mb-4">
          <h3 className="text-lg font-bold text-foreground">Your Uploaded Resumes</h3>
          <p className="text-sm text-muted-foreground mt-1">Select a resume below to launch optimization tasks.</p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>You haven't uploaded any resumes yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs font-bold text-muted-foreground uppercase">
                  <th className="pb-3 font-semibold">Filename</th>
                  <th className="pb-3 font-semibold">Upload Date</th>
                  <th className="pb-3 font-semibold">Extracted Email</th>
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
                        <span>{new Date(resume.uploadDate).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground truncate max-w-[150px]">
                      {resume.profile?.email || 'N/A'}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/analysis?resumeId=${resume.id}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:shadow-md transition-all flex items-center space-x-1"
                        >
                          <span>Analyze</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(resume.id)}
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
        )}
      </div>
    </div>
  );
};

export default UploadResume;
