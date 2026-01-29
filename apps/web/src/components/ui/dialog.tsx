"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";

interface DialogProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Dialog({ title, description, children, isOpen, onClose }: DialogProps) {
  if (!isOpen) return null;

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Prevent scrolling when dialog is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40" 
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.2 }}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX />
          </button>
        </div>
        
        {children}
      </motion.div>
    </div>
  );
}