import React from "react";

export const EmailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="5" y="6.5" width="14" height="11" rx="1.5" strokeWidth="1.6" />
    <path d="M5.5 7.5L12 13L18.5 7.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UpworkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="8.25" strokeWidth="1.8" />
    <path
      d="M8.25 13.5L12 9.25L15.75 13.5"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16.3" cy="7.7" r="1.6" fill="#14A800" stroke="none" />
  </svg>
);
