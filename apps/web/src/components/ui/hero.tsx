"use client";

import React from "react";
import { motion } from "framer-motion";
import { GradientButton } from "./gradient-button";
import { MotionDiv } from "./motion-div";
import { cn } from "@/lib/utils";

interface HeroProps {
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  backgroundPattern?: "dots" | "grid" | "waves" | "shapes" | "gradient" | "none";
  illustration?: React.ReactNode;
  layout?: "default" | "centered" | "reversed" | "overlapping";
  theme?: "light" | "dark" | "colored";
  className?: string;
  illustrationClassName?: string;
  contentClassName?: string;
}

export function Hero({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  backgroundPattern = "dots",
  illustration,
  layout = "default",
  theme = "light",
  className,
  illustrationClassName,
  contentClassName,
}: HeroProps) {
  const showPattern = backgroundPattern !== "none";
  
  // Theme-based styles
  const themeStyles = {
    light: {
      bg: "bg-white",
      text: "text-gray-900",
      subtext: "text-gray-600",
    },
    dark: {
      bg: "bg-gray-900",
      text: "text-white",
      subtext: "text-gray-300",
    },
    colored: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
      text: "text-gray-900",
      subtext: "text-gray-700",
    },
  };

  // Layout-based styles - improved for better mobile responsiveness
  const layoutStyles = {
    default: "flex flex-col lg:flex-row items-center gap-8 lg:gap-16",
    centered: "flex flex-col items-center text-center",
    reversed: "flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16",
    overlapping: "relative grid grid-cols-1 lg:grid-cols-2 items-center pt-10 md:pt-16 pb-32 md:pb-16 gap-y-12 md:gap-y-0",
  };

  const renderShapes = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-40 -left-40 h-80 w-80 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-40 right-10 h-60 w-60 rounded-full bg-pink-200 opacity-20 blur-3xl"></div>
    </div>
  );

  const renderGradient = () => (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-blue-100/20 to-transparent"></div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-indigo-100/20 to-transparent"></div>
    </div>
  );

  return (
    <div className={cn(
      "relative overflow-hidden px-4 sm:px-6 py-16 sm:py-24 md:py-28 lg:py-32 lg:px-8",
      themeStyles[theme].bg,
      className
    )}>
      {showPattern && (
        <>
          {backgroundPattern === "shapes" && renderShapes()}
          {backgroundPattern === "gradient" && renderGradient()}
          {(backgroundPattern === "dots" || backgroundPattern === "grid" || backgroundPattern === "waves") && (
            <div className="absolute inset-0 -z-10 opacity-10">
              <svg
                className="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
              >
                <defs>
                  {backgroundPattern === "dots" && (
                    <pattern
                      id="pattern-dots"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="2" cy="2" r="1" fill="currentColor" />
                    </pattern>
                  )}
                  {backgroundPattern === "grid" && (
                    <pattern
                      id="pattern-grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M0 20h40M20 0v40"
                        stroke="currentColor"
                        strokeWidth={0.5}
                      />
                    </pattern>
                  )}
                  {backgroundPattern === "waves" && (
                    <pattern
                      id="pattern-waves"
                      width="100"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M0 10 C20 20, 40 0, 60 10 C80 20, 100 0, 120 10"
                        stroke="currentColor"
                        strokeWidth={0.5}
                        fill="none"
                      />
                    </pattern>
                  )}
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill={`url(#pattern-${backgroundPattern})`}
                />
              </svg>
            </div>
          )}
        </>
      )}

      <div className="mx-auto max-w-7xl">
        <div className={layoutStyles[layout]}>
          <div className={cn(
            layout === "centered" ? "w-full max-w-4xl mx-auto" : 
            layout === "overlapping" ? "col-span-1 lg:col-span-2 z-10" : 
            "w-full lg:w-1/2", 
            contentClassName
          )}>
            <MotionDiv 
              animation={layout === "reversed" ? "slideLeft" : "slideRight"} 
              className={cn(
                layout === "centered" ? "" : 
                layout === "overlapping" ? "lg:w-1/2 pr-0 sm:pr-4" : 
                "lg:pr-8"
              )} 
              delay={0.1}
            >
              {/* Handle title as string or custom React node */}
              {typeof title === "string" ? (
                <h1 className={cn(
                  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight", 
                  themeStyles[theme].text
                )}>
                  {title}
                </h1>
              ) : (
                title
              )}

              <div className={cn(
                "mt-4 sm:mt-6", 
                themeStyles[theme].subtext
              )}>
                {typeof subtitle === "string" ? (
                  <p className="text-base sm:text-lg leading-7 sm:leading-8 max-w-3xl">
                    {subtitle}
                  </p>
                ) : (
                  subtitle
                )}
              </div>

              <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-x-6">
                {primaryAction && (
                  <div className="w-full sm:w-auto">{primaryAction}</div>
                )}
                {!primaryAction && primaryActionLabel && (
                  <GradientButton
                    onClick={onPrimaryAction}
                    size="lg"
                    className="w-full sm:w-auto text-base font-semibold"
                  >
                    {primaryActionLabel}
                  </GradientButton>
                )}
                
                {secondaryAction && (
                  <div className="w-full sm:w-auto mt-3 sm:mt-0">{secondaryAction}</div>
                )}
                {!secondaryAction && secondaryActionLabel && (
                  <GradientButton
                    variant="ghost"
                    onClick={onSecondaryAction}
                    size="lg"
                    className="w-full sm:w-auto mt-3 sm:mt-0 text-base font-semibold"
                  >
                    {secondaryActionLabel}
                  </GradientButton>
                )}
              </div>
            </MotionDiv>
          </div>

          {illustration && (
            <MotionDiv 
              animation={layout === "reversed" ? "slideRight" : layout === "overlapping" ? "slideUp" : "slideLeft"} 
              className={cn(
                layout === "centered" ? "mt-10 sm:mt-12 md:mt-16 w-full max-w-lg mx-auto" : 
                layout === "overlapping" ? 
                  "lg:absolute lg:right-0 lg:top-0 w-full sm:w-4/5 md:w-3/4 lg:w-2/3 h-auto lg:h-full px-4 sm:px-0 mx-auto sm:mr-0 sm:ml-auto" : 
                "w-full lg:w-1/2 mt-8 lg:mt-0",
                illustrationClassName
              )} 
              delay={0.3}
            >
              {illustration}
            </MotionDiv>
          )}
        </div>
      </div>
    </div>
  );
}
