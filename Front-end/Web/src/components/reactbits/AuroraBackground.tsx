import React from 'react';

export const AuroraBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-b from-[#ff5c8d]/18 via-[#dce944]/12 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#b31f56]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 -right-32 w-80 h-80 bg-[#dce944]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      {children}
    </div>
  );
};
