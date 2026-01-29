import React from "react";
import Link from "next/link";
import { Hero } from "@/components/ui/hero";
import { MotionDiv } from "@/components/ui/motion-div";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Abstract geometric background */}
      <div className="absolute inset-0 z-0 bg-[#FCFCFC]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-200 0H1640V800H-200V0Z" fill="white"/>
          <path opacity="0.05" d="M1086.59 0L0 650V800H1440V0H1086.59Z" fill="url(#paint0_linear_1_2)"/>
          <path opacity="0.1" d="M970.262 0L0 550V800H1440V0H970.262Z" fill="url(#paint1_linear_1_2)"/>
          <path opacity="0.15" d="M854.5 0L0 450V800H1440V0H854.5Z" fill="url(#paint2_linear_1_2)"/>
          <defs>
            <linearGradient id="paint0_linear_1_2" x1="720" y1="0" x2="720" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4338CA"/>
              <stop offset="1" stopColor="#6366F1" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="paint1_linear_1_2" x1="720" y1="0" x2="720" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5"/>
              <stop offset="1" stopColor="#818CF8" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="paint2_linear_1_2" x1="720" y1="0" x2="720" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1"/>
              <stop offset="1" stopColor="#A5B4FC" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Particle effect layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
        
        {/* Animated dots */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-indigo-600/5 rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 sm:pt-16 sm:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Content side */}
          <div>
            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-6"
            >
              <Badge className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                Just launched: Enhanced Collaboration Features
              </Badge>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                Document <span className="relative inline-block">
                  Everything<span className="absolute -bottom-2 left-0 right-0 h-1 bg-indigo-600 rounded-full"></span>
                </span> in One Place
              </h1>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl"
            >
              <p>
                Streamline your note-taking workflow with our powerful editor. Create, organize, and share your ideas with unmatched simplicity and elegance.
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {isAuthenticated ? (
                <>
                  <Link href="/notes">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-medium text-lg w-full sm:w-auto">
                      Open My Notes
                    </Button>
                  </Link>
                  <Link href="/notes/new">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg font-medium text-lg w-full sm:w-auto">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      New Note
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-medium text-lg w-full sm:w-auto">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg font-medium text-lg w-full sm:w-auto">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                      </svg>
                      Log In
                    </Button>
                  </Link>
                </>
              )}
            </MotionDiv>

            {/* Feature tags */}
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap gap-3 mt-8"
            >
              {['Rich Text', 'Markdown', 'Real-time Sync', 'Folders', 'Dark Mode', 'Sharing'].map((feature, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <svg className="w-3 h-3 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  {feature}
                </span>
              ))}
            </MotionDiv>
            
            {/* Trust badges */}
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-8 flex items-center text-sm text-gray-500"
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white bg-indigo-${500 + i * 100}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="ml-3">Trusted by 50,000+ users worldwide</span>
            </MotionDiv>
          </div>

          {/* Dashboard preview side */}
          <MotionDiv
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative"
          >
            {/* Dashboard window */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Window header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex items-center h-6 overflow-hidden rounded bg-gray-100 flex-1 max-w-xs mx-4 px-2">
                  <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <div className="text-xs text-gray-400 truncate">notes.app</div>
                </div>
                <div className="flex space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
              </div>

              {/* Application UI */}
              <div className="flex min-h-[400px]">
                {/* Sidebar */}
                <div className="w-56 bg-gray-50 border-r border-gray-200 flex-shrink-0 hidden sm:block">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-24 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="mt-6 space-y-1">
                      {[...Array(3)].map((_, i) => (
                        <MotionDiv
                          key={i}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 0.8 + i * 0.2, duration: 0.6 }}
                        >
                          <div className={`h-10 rounded ${i === 0 ? 'bg-indigo-100' : 'bg-gray-200'}`}></div>
                        </MotionDiv>
                      ))}
                    </div>
                    <div className="mt-6">
                      <div className="h-5 w-20 bg-gray-200 rounded mb-3"></div>
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <MotionDiv
                            key={i}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                          >
                            <div className="h-8 w-full bg-gray-200 rounded"></div>
                          </MotionDiv>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main content area */}
                <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">
                  {/* Note title */}
                  <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.8 }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="h-8 w-8 rounded flex items-center justify-center bg-indigo-100 mr-3">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <div className="h-8 bg-gray-800 rounded w-3/4"></div>
                    </div>
                  </MotionDiv>

                  {/* Note content */}
                  <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.8 }}
                  >
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>

                    <div className="my-6 border-l-4 border-indigo-500 bg-indigo-50 p-3 rounded">
                      <div className="h-3 bg-indigo-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-indigo-200 rounded w-2/3"></div>
                    </div>

                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </MotionDiv>

                  {/* Toolbar */}
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                    className="mt-auto"
                  >
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                      <div className="flex space-x-2">
                        {['B', 'I', 'U'].map((letter, i) => (
                          <div key={i} className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 text-xs font-medium text-gray-600">
                            {letter}
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-8 w-8 bg-gray-100 rounded"></div>
                        <div className="h-8 w-8 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </MotionDiv>
                </div>
              </div>
            </div>

            {/* Floating elements for visual interest */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-yellow-400 rounded-lg transform rotate-12 hidden lg:block"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-indigo-200 rounded-full hidden lg:block"></div>
            <div className="absolute bottom-10 -right-6 w-8 h-24 bg-indigo-600 rounded-lg transform -rotate-12 hidden lg:block"></div>
          </MotionDiv>
        </div>

        {/* Stats row */}
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 sm:mt-20 flex flex-col sm:flex-row justify-center items-center sm:items-stretch divide-y sm:divide-y-0 sm:divide-x divide-gray-300"
        >
          {[
            { value: '50K+', label: 'Active Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { value: '99.9%', label: 'Uptime', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { value: '24/7', label: 'Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
          ].map((stat, index) => (
            <div key={index} className="px-8 py-4 sm:py-0 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path>
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </MotionDiv>
      </div>
    </section>
  );
}