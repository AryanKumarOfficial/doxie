'use client';

import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from 'react-error-boundary';

function FallbackComponent({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-600 font-medium text-lg mb-2">Authentication Error</h2>
      <p className="text-red-700">
        {error.message || "An error occurred during authentication."}
      </p>
      <button 
        onClick={() => window.location.href = '/login'} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Go to Login
      </button>
    </div>
  );
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <SessionProvider>{children}</SessionProvider>
    </ErrorBoundary>
  );
}