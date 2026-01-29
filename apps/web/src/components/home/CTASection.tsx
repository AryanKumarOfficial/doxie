import React from 'react';
import Link from 'next/link';
import { MotionDiv } from '@/components/ui/motion-div';

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              Ready to transform your note-taking experience?
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-blue-100">
              Join thousands of users who have already revolutionized the way they capture and organize their ideas.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-4 sm:space-y-0">
              <Link 
                href="/register"
                className="inline-flex items-center justify-center px-5 sm:px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
              >
                Get started for free
              </Link>
              <Link 
                href="/notes/demo"
                className="inline-flex items-center justify-center px-5 sm:px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-900 bg-opacity-60 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
              >
                Try a demo
              </Link>
            </div>
          </MotionDiv>
          
          <MotionDiv
            className="mt-10 sm:mt-12 flex flex-col justify-center items-center gap-4 sm:gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-xs sm:text-sm text-blue-100 font-medium">Trusted by individuals and teams at</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
              {['Google', 'Microsoft', 'Adobe', 'Spotify', 'Dropbox'].map((company) => (
                <div key={company} className="text-white text-sm sm:text-base font-semibold opacity-80">
                  {company}
                </div>
              ))}
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}