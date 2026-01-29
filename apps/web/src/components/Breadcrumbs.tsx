"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BreadcrumbList, WithContext } from "schema-dts";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs based on path if not provided
  const breadcrumbs = items || generateBreadcrumbs(pathname);
  
  // Generate JSON-LD structured data
  const breadcrumbsJsonLd: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://doxie.vercel.app${item.path}`,
    })),
  };
  
  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      
      {/* Visual breadcrumbs */}
      <nav className={`flex text-sm ${className}`} aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1 md:space-x-2">
          {breadcrumbs.map((item, index) => (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <span className="mx-1 text-gray-400">/</span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-600" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

// Helper function to generate breadcrumbs from path
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];
  
  let currentPath = '';
  
  paths.forEach((path) => {
    currentPath += `/${path}`;
    
    // Format the name from the path (capitalize, replace hyphens with spaces)
    let name = path
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
      
    // Handle special cases (e.g., IDs)
    if (path === 'notes' && currentPath === '/notes') {
      name = 'Notes';
    } else if (path === 'new' && currentPath === '/notes/new') {
      name = 'New Note';
    } else if (path === 'login') {
      name = 'Login';
    } else if (path === 'register') {
      name = 'Register';
    }
    
    breadcrumbs.push({ name, path: currentPath });
  });
  
  return breadcrumbs;
}
