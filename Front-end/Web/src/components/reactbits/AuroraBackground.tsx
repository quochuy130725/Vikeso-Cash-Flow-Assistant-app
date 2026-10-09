import React from 'react';

export const AuroraBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-b from-[#d0f81b]/18 via-lime-200/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#d0f81b]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 -right-32 w-80 h-80 bg-[#d0f81b]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      {children}
    </div>
  );
};
