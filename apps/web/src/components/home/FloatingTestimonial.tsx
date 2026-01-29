import React from 'react';
import Image from 'next/image';
import { MotionDiv } from '@/components/ui/motion-div';

interface FloatingTestimonialProps {
  quote: string;
  author: string;
  position: string;
  image: string;
  posX: string;
  posY: string;
  delay?: number;
}

export function FloatingTestimonial({
  quote,
  author,
  position,
  image,
  posX,
  posY,
  delay = 0
}: FloatingTestimonialProps) {
  return (
    <MotionDiv
      className="absolute flex flex-col bg-white p-5 rounded-xl shadow-lg border border-blue-50 max-w-xs"
      style={{
        left: posX,
        top: posY,
      }}
      initial={{ 
        opacity: 0, 
        y: 30, 
        scale: 0.95,
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        scale: 1, 
      }}
      transition={{ 
        duration: 0.8, 
        delay,
        type: "spring",
        stiffness: 50
      }}
      viewport={{ once: true }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <div className="mb-4">
        {/* Quote marks */}
        <svg className="w-7 h-7 text-blue-400 mb-2 opacity-70" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.96.78-3.022.684-1.06 1.304-1.78 1.86-2.164.393-.25.753-.19 1.08.18.34.39.35.786.02 1.18-.32.383-.75.753-1.28 1.11.48.237.87.795 1.16 1.67.29.87.45 1.42.45 1.648v.433c-.13.433-.33.75-.61.95-.28.2-.71.3-1.29.3-.54 0-.96-.15-1.27-.44-.31-.29-.47-.7-.47-1.24 0-.15.33-.76.99-1.83.37-.24.58-.36.63-.36-.08-.3-.3-.21-.57.27-.27.48-.39.84-.39 1.06 0 .21.06.39.17.54.11.15.28.22.52.22.16 0 .28-.03.36-.07.08-.04.16-.09.21-.15.05-.07.09-.15.11-.24.03-.1.04-.19.04-.31zm7.457 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.695-1.327-.825-.56-.13-1.083-.14-1.57-.025-.16-.94.09-1.95.75-3.02.66-1.06 1.29-1.78 1.89-2.164.39-.25.75-.19 1.09.18.33.39.33.786 0 1.18-.33.383-.75.753-1.28 1.11.5.237.88.795 1.17 1.67.29.87.44 1.42.44 1.648v.433c-.13.433-.33.75-.61.95-.28.2-.71.3-1.29.3-.54 0-.96-.15-1.26-.44-.32-.29-.48-.7-.48-1.24 0-.15.33-.76.99-1.83.36-.24.58-.36.63-.36-.08-.3-.3-.21-.57.27-.28.48-.39.84-.39 1.06 0 .21.06.39.17.54.11.15.28.22.52.22.16 0 .28-.03.37-.07.08-.04.16-.09.21-.15.05-.07.08-.15.11-.24.02-.1.03-.19.03-.31z" />
        </svg>
        
        <p className="text-sm text-gray-700">{quote}</p>
      </div>
      
      <div className="flex items-center mt-auto">
        <div className="relative w-10 h-10 mr-3 rounded-full overflow-hidden">
          <Image
            src={image}
            alt={author}
            // layout="fill"
            objectFit="cover"
            width={40}
            height={40}
          />
        </div>
        <div>
          <h5 className="font-medium text-sm">{author}</h5>
          <p className="text-xs text-gray-500">{position}</p>
        </div>
      </div>
    </MotionDiv>
  );
}