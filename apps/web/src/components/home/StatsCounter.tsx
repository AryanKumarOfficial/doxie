import React from "react";
import { MotionDiv } from "@/components/ui/motion-div";

interface StatsCounterProps { 
  value: string; 
  label: string; 
  icon: string; // Changed from React.ReactNode to string
  delay?: number;
}

export function StatsCounter({ 
  value, 
  label, 
  icon,
  delay = 0
}: StatsCounterProps) {
  return (
    <MotionDiv
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        delay 
      }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="p-6 bg-white rounded-2xl shadow-md border border-blue-50 hover:shadow-lg hover:border-blue-100 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-xl"></div>
        
        <div className="flex flex-col items-center">
          <div className="text-blue-600 mb-4">
            {/* Render SVG with the path string */}
            <svg 
              className="w-8 h-8" 
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
          <MotionDiv
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.5, type: "spring" }}
            viewport={{ once: true }}
            className="font-bold text-3xl md:text-4xl text-gray-800 mb-1 relative"
          >
            <span>{value}</span>
            <div className="absolute -top-1 -right-3 w-5 h-5 bg-blue-100 rounded-full blur-md"></div>
          </MotionDiv>
          <p className="text-gray-600 font-medium">{label}</p>
        </div>
      </div>
    </MotionDiv>
  );
}