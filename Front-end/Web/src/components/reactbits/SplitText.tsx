import React from 'react';
import { motion } from 'motion/react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  highlightText?: string;
  highlightClassName?: string;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  highlightText,
  highlightClassName = 'bg-gradient-to-r from-[#b31f56] via-[#ff5c8d] to-[#dce944] bg-clip-text text-transparent',
}) => {
  if (highlightText && text.includes(highlightText)) {
    const parts = text.split(highlightText);
    return (
      <span className={className}>
        <SplitText text={parts[0]} delay={delay} />
        <span className={highlightClassName}>
          <SplitText text={highlightText} delay={delay + parts[0].length * 15} />
        </span>
        {parts[1] && <SplitText text={parts[1]} delay={delay + (parts[0].length + highlightText.length) * 15} />}
      </span>
    );
  }

  const words = text.split(' ');

  return (
    <span className={`inline-block ${className}`} style={{ overflow: 'hidden' }}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ opacity: 0, y: 35, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 0.4,
                delay: (wordIndex * 4 + charIndex) * (delay / 1000),
                ease: [0.2, 0.65, 0.3, 0.9],
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};
