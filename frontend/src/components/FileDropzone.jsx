import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';

const FileDropzone = ({ onFileSelect, acceptedFormats = ['.pdf', '.docx'], maxSizeMb = 5 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const validateFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return false;

    // Check extension
    const name = selectedFile.name.toLowerCase();
    const isAccepted = acceptedFormats.some((ext) => name.endsWith(ext));
    if (!isAccepted) {
      setError(`Unsupported format. Please upload ${acceptedFormats.join(' or ')} files.`);
      return false;
    }

    // Check size
    const sizeMb = selectedFile.size / (1024 * 1024);
    if (sizeMb > maxSizeMb) {
      setError(`File is too large. Maximum limit is ${maxSizeMb}MB.`);
      return false;
    }

    return true;
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        onFileSelect(droppedFile);
      }
    }
  }, [onFileSelect]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        onFileSelect(selectedFile);
      }
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    onFileSelect(null);
    setError('');
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative w-full rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-primary bg-primary/5 scale-[0.99]'
            : 'border-border hover:border-primary/50 bg-card hover:bg-secondary/10'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={acceptedFormats.join(',')}
          onChange={handleChange}
        />

        {!file ? (
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Drag & drop your resume here, or <span className="text-primary hover:underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Supports PDF and DOCX formats (Max {maxSizeMb}MB)
              </p>
            </div>
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/80 border border-border animate-scale-up">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="max-w-[280px] md:max-w-sm truncate">
                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              type="button"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-border hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center space-x-2 text-rose-500 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl text-sm font-medium animate-slide-up">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
