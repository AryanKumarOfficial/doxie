import React from "react";
import { MotionDiv } from "@/components/ui/motion-div";

interface Feature3DCardProps { 
  title: string; 
  description: string; 
  icon: string; // Changed from React.ReactNode to string
  delay?: number;
}

export function Feature3DCard({ 
  title, 
  description, 
  icon, 
  delay = 0 
}: Feature3DCardProps) {
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
      whileHover={{ 
        y: -8, 
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 10 
        } 
      }}
    >
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-gray-100">
        {/* Animated gradient border */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        
        {/* Background blur elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-100 rounded-full opacity-20 blur-2xl group-hover:bg-blue-200 transition-colors duration-500"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-100 rounded-full opacity-10 blur-2xl group-hover:bg-teal-200 transition-colors duration-500"></div>
        
        <div className="relative z-10 flex flex-col h-full p-8">
          <MotionDiv
            initial={{ scale: 0.9, opacity: 0.8 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.4 }}
            whileHover={{ 
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.5 }
            }}
          >
            <div className="p-4 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl text-blue-600 mb-5 w-fit shadow-sm group-hover:shadow-md transition-shadow duration-300">
              {/* Render SVG with the path string */}
              <svg 
                className="w-6 h-6" 
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
          </MotionDiv>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">{title}</h3>
          <p className="text-gray-600 flex-grow group-hover:text-gray-700 transition-colors duration-300">{description}</p>
          
          <div className="mt-6">
            <MotionDiv
              initial={{ x: -5, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <span className="text-blue-600 font-medium text-sm flex items-center cursor-pointer">
                Learn more
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </span>
            </MotionDiv>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}