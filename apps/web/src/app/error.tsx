'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong!</h2>
          <p className="text-gray-600 mb-6">
            We apologize for the inconvenience. The application encountered an unexpected error.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700" 
              onClick={reset}
            >
              Try Again
            </Button>
            
            <Link href="/" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full"
              >
                Go to Homepage
              </Button>
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md w-full overflow-auto text-left">
              <h3 className="font-mono text-sm font-semibold mb-2 text-gray-700">Error Details:</h3>
              <p className="font-mono text-xs text-gray-800 whitespace-pre-wrap break-all">
                {error.message}
                {error.stack && (
                  <>
                    <br /><br />
                    {error.stack}
                  </>
                )}
              </p>
              {error.digest && (
                <p className="mt-2 font-mono text-xs text-gray-600">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}