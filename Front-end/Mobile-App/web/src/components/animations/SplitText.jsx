import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Inspired by ReactBits SplitText
export const SplitText = ({ text, className = '', delay = 0 }) => {
  const words = text.split(' ');

  return (
    <span className={className} style={{ display: 'inline-block', overflow: 'hidden' }}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {word.split('').map((char, charIndex) => {
            const index = wordIndex * 10 + charIndex; // simple index for stagger
            return (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.175, 0.885, 0.32, 1.275], // easeOutBack-ish
                  delay: delay + index * 0.05
                }}
                style={{ display: 'inline-block' }}
              >
                {char}
              </motion.span>
            );
          })}
          {wordIndex !== words.length - 1 && <span style={{ display: 'inline-block' }}>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
};
