import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  toggleSidebar: () => void;
  children?: React.ReactNode;
}

const PageHeader = ({ title, toggleSidebar, children }: PageHeaderProps) => {
  return (
    <motion.div
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="md:hidden bg-blue-600 text-white p-2 rounded-md shadow-sm flex items-center justify-center"
          aria-label="Toggle Sidebar"
        >
          <FiMenu size={20} />
        </button>
        
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          {title}
        </h1>
      </div>
      
      {children && (
        <div className="flex flex-col sm:flex-row gap-2">
          {children}
        </div>
      )}
    </motion.div>
  );
};

export { PageHeader };