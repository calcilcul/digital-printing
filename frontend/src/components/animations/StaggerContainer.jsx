import React from 'react';
import { m } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function StaggerContainer({ children, className = "" }) {
  return (
    <m.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <m.div variants={itemVariants}>{child}</m.div>
      ))}
    </m.div>
  );
}
