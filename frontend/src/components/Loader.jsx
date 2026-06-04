import React from 'react';

const Loader = ({ message = "Processing...", size = "md" }) => {
  const spinnerSize = size === "sm" ? "h-6 w-6 border-2" : size === "lg" ? "h-16 w-16 border-4" : "h-12 w-12 border-3";

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in">
      <div className={`relative ${size === 'lg' ? 'h-20 w-20' : 'h-14 w-14'} flex items-center justify-center`}>
        {/* Glow behind loader */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        {/* Animated Double Ring Spinner */}
        <div className={`rounded-full border-t-primary border-r-transparent border-b-primary/30 border-l-transparent animate-spin ${spinnerSize}`}></div>
      </div>
      {message && (
        <p className="text-muted-foreground text-sm font-medium animate-pulse tracking-wide uppercase">
          {message}
        </p>
      )}
    </div>
  );
};

export const Skeleton = ({ className }) => {
  return (
    <div className={`bg-secondary/60 animate-pulse rounded-lg border border-border/40 ${className}`}></div>
  );
};

export default Loader;
