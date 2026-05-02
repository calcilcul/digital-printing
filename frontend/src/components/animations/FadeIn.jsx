import React from 'react';
import { m } from 'framer-motion';

export function FadeIn({ children, delay = 0, duration = 0.5, className = "" }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}
