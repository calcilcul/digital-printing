import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';

export default function IntroLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    // Simulate loading progress
    const duration = 2500; // 2.5 seconds total loading
    const interval = 50; // update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete(); // Trigger exit
        }, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Interactive parallax effect based on mouse movement
  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePosition({ x, y });
  };

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0, 
          scale: 1.1,
          filter: "blur(10px)",
          transition: { duration: 0.8, ease: "easeInOut" } 
        }}
        onMouseMove={handleMouseMove}
        className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center overflow-hidden cursor-none"
      >
        {/* Interactive Background Orbs */}
        <m.div 
          className="absolute w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none"
          animate={{
            x: `${(mousePosition.x - 50) * -1}%`,
            y: `${(mousePosition.y - 50) * -1}%`,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <m.div 
          className="absolute w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-secondary-500/20 blur-[100px] pointer-events-none"
          animate={{
            x: `${(mousePosition.x - 50) * 1.5}%`,
            y: `${(mousePosition.y - 50) * 1.5}%`,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 25 }}
        />

        {/* Floating Particles (CSS Animation logic could be here, but using Framer is better) */}
        {[...Array(20)].map((_, i) => (
          <m.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 pointer-events-none"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 2,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight - 200],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          
          <m.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-[0_0_40px_rgba(37,99,235,0.4)] mb-6 mx-auto transform rotate-3">
              J
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              JAYA MANDIRI
            </h1>
            <p className="text-slate-400 mt-2 font-medium tracking-widest text-sm uppercase">
              Digital Printing
            </p>
          </m.div>

          {/* Minimalist Progress Bar */}
          <m.div 
            className="w-64 max-w-[80vw] h-1 bg-slate-800 rounded-full overflow-hidden mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <m.div 
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-400 rounded-full"
              style={{ width: `${progress}%` }}
              layout
            />
          </m.div>

          <m.div 
            className="mt-4 text-xs font-mono text-slate-500 tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {Math.round(progress)}%
          </m.div>
        </div>

        {/* Custom interactive cursor ring */}
        <m.div 
          className="fixed w-8 h-8 border border-white/30 rounded-full pointer-events-none z-50 hidden md:block"
          animate={{
            x: mousePosition.x * (window.innerWidth / 100) - 16,
            y: mousePosition.y * (window.innerHeight / 100) - 16,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
        />
        <m.div 
          className="fixed w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-50 hidden md:block"
          animate={{
            x: mousePosition.x * (window.innerWidth / 100) - 3,
            y: mousePosition.y * (window.innerHeight / 100) - 3,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        />

      </m.div>
    </AnimatePresence>
  );
}
