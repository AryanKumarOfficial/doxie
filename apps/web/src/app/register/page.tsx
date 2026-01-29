import { Metadata } from "next";
import { Suspense } from "react";
import RegisterClient from "./register-client";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new Doxie account to start taking notes and organizing your ideas",
  robots: {
    index: false,
    follow: true,
  },
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <RegisterClient />
    </Suspense>
  );
}