import React from "react";
import Link from "next/link";
import { MotionDiv } from "@/components/ui/motion-div";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  delay?: number;
  buttonText?: string;
  buttonHref?: string;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  popular = false,
  delay = 0,
  buttonText = "Get Started",
  buttonHref = "#"
}: PricingCardProps) {
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
      <div className={`group relative rounded-2xl overflow-hidden h-full border ${popular ? 'border-blue-200 shadow-xl shadow-blue-100' : 'border-gray-200 shadow-lg'} hover:shadow-xl hover:border-blue-200 transition-all duration-300 bg-white`}>
        {popular && (
          <div className="absolute top-0 right-0">
            <div className="text-xs font-bold text-white px-3 py-1 bg-gradient-to-r from-blue-500 to-teal-500 transform rotate-45 translate-x-5 -translate-y-1">
              POPULAR
            </div>
          </div>
        )}
        
        <div className={`p-8 ${popular ? 'bg-gradient-to-br from-blue-50 to-white' : ''}`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
          <div className="flex items-baseline mb-4">
            <span className="text-4xl font-extrabold text-gray-900">{price}</span>
            {price !== "Free" && <span className="text-gray-500 ml-1">/month</span>}
          </div>
          <p className="text-gray-600 mb-8">{description}</p>
          
          <Link href={buttonHref}>
            <Button 
              className={`w-full mb-8 py-5 ${popular 
                ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-600/30' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } transition-all duration-300 font-medium`}
            >
              {buttonText}
            </Button>
          </Link>
          
          <ul className="space-y-3 text-sm">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MotionDiv>
  );
}