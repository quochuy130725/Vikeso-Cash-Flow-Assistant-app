import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  children?: React.ReactNode;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 4,
  className = '',
  children,
}) => {
  return (
    <span
      className={`inline-block relative overflow-hidden bg-clip-text text-transparent bg-gradient-to-r from-inherit via-white/80 to-inherit ${
        disabled ? '' : 'animate-shiny'
      } ${className}`}
      style={{
        animationDuration: `${speed}s`,
        backgroundImage: disabled
          ? 'none'
          : 'linear-gradient(110deg, currentColor 30%, rgba(255,255,255,0.95) 50%, currentColor 70%)',
      }}
    >
      {children || text}
    </span>
  );
};
