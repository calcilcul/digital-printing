import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { m } from 'framer-motion';

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();

  return (
    <m.button
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm ${className}`}
    >
      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
        <ArrowLeft size={16} />
      </div>
      <span>Kembali</span>
    </m.button>
  );
}
