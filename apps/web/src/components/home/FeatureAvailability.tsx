import React from "react";
import { MotionDiv } from "@/components/ui/motion-div";

export function FeatureAvailable() {
  return (
    <MotionDiv
      whileHover={{ scale: 1.2 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      <svg className="w-5 h-5 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </MotionDiv>
  );
}

export function FeatureUnavailable() {
  return (
    <MotionDiv
      whileHover={{ scale: 1.2 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      <svg className="w-5 h-5 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </MotionDiv>
  );
}