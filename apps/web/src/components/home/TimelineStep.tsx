import React from 'react';
import { MotionDiv } from '@/components/ui/motion-div';

interface TimelineStepProps {
  title: string;
  description: string;
  icon: string;
  position?: 'left' | 'right';
  delay?: number;
  isMobile?: boolean;
}

export function TimelineStep({
  title,
  description,
  icon,
  position = 'left',
  delay = 0,
  isMobile = false
}: TimelineStepProps) {
  // For mobile layout
  if (isMobile) {
    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
        viewport={{ once: true, margin: "-20px" }}
      >
        <div className="relative pb-2">
          {/* Circle on timeline */}
          <div className="absolute -left-[36px] top-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center z-10 shadow-md shadow-blue-500/20">
            <svg 
              className="w-4 h-4 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={icon}
              ></path>
            </svg>
          </div>
          
          {/* Content Card */}
          <MotionDiv
            className="bg-white rounded-lg p-4 shadow-md border border-gray-100 w-full relative group"
            whileHover={{ 
              y: -2,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.05)"
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-lg transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-300 ease-in-out"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </MotionDiv>
        </div>
      </MotionDiv>
    );
  }
  
  // For desktop layout
  return (
    <div className="relative">
      {/* Circle on timeline */}
      <MotionDiv 
        className="absolute left-1/2 top-[calc(50%-12px)] transform -translate-x-1/2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center z-10 shadow-lg shadow-blue-500/30"
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 0 15px 2px rgba(59, 130, 246, 0.5)",
        }}
        initial={{ scale: 0.8 }}
        whileInView={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300,
          delay: delay + 0.2
        }}
        viewport={{ once: true }}
      >
        <svg 
          className="w-4 h-4 lg:w-5 lg:h-5 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d={icon}
          ></path>
        </svg>
      </MotionDiv>
      
      {/* Content layout */}
      <div className={`grid grid-cols-2 gap-0`}>
        <MotionDiv
          className={`${position === 'left' ? 'col-span-1 pr-8 text-right' : 'col-start-2 pl-8'}`}
          initial={{ opacity: 0, x: position === 'left' ? -20 : 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay, type: "spring", stiffness: 80 }}
          viewport={{ once: true }}
        >
          <div 
            className="
              bg-white rounded-lg p-5 lg:p-6 shadow-md hover:shadow-lg border border-gray-100
              relative group transition-all duration-300
            "
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-lg transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-300 ease-in-out"></div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 lg:mb-2 group-hover:text-blue-600 transition-colors duration-200">{title}</h3>
            <p className="text-gray-600 text-sm lg:text-base">{description}</p>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}