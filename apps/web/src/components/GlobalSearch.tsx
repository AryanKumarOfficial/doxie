"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  FiSearch, 
  FiFile, 
  FiX, 
  FiClock, 
  FiFolder, 
  FiTag, 
  FiFilter, 
  FiStar, 
  FiCalendar,
  FiArrowLeft
} from "react-icons/fi";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// Define breakpoints for consistent responsive behavior
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px'
};

interface SearchResult {
  id: string;
  _id: string;
  title: string;
  snippet: string;
  updatedAt: string;
  folder: string;
  tags?: string[];
  isPinned?: boolean;
}

interface FilterOptions {
  folder: string | null;
  timeRange: 'all' | 'today' | 'week' | 'month';
  onlyPinned: boolean;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'results' | 'recent' | 'filters'>('results');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    folder: null,
    timeRange: 'all',
    onlyPinned: false
  });
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Detect mobile view
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // Handle parsing error
        setRecentSearches([]);
      }
    }
    
    // Load available folders for filtering
    const fetchFoldersAndTags = async () => {
      try {
        const response = await fetch('/api/notes/folder-counts');
        if (response.ok) {
          const data = await response.json();
          setAvailableFolders(Object.keys(data.folderCounts));
        }
        
        // This is a placeholder - you might need to create a separate endpoint for tags
        // or extract them from existing search results
        setAvailableTags(['important', 'work', 'personal', 'ideas']);
      } catch (error) {
        console.error("Failed to fetch folders:", error);
      }
    };
    
    if (isOpen) {
      fetchFoldersAndTags();
    }
  }, [isOpen]);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const updated = [
      searchTerm,
      ...recentSearches.filter(term => term !== searchTerm)
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Close search with Escape
      if (e.key === "Escape") {
        if (showFilters) {
          setShowFilters(false);
        } else {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFilters]);

  // Handle outside click to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Focus input when search is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Build search query with filters
  const buildSearchQuery = () => {
    let searchParams = new URLSearchParams();
    searchParams.append('q', query);
    searchParams.append('limit', '10');
    
    if (filters.folder) {
      searchParams.append('folder', filters.folder);
    }
    
    if (filters.onlyPinned) {
      searchParams.append('pinned', 'true');
    }
    
    if (filters.timeRange !== 'all') {
      const now = new Date();
      let fromDate = new Date();
      
      if (filters.timeRange === 'today') {
        fromDate.setHours(0, 0, 0, 0);
      } else if (filters.timeRange === 'week') {
        fromDate.setDate(now.getDate() - 7);
      } else if (filters.timeRange === 'month') {
        fromDate.setMonth(now.getMonth() - 1);
      }
      
      searchParams.append('from', fromDate.toISOString());
    }
    
    return searchParams.toString();
  };

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          const queryString = buildSearchQuery();
          const response = await fetch(`/api/notes/search?${queryString}`);
          if (response.ok) {
            const data = await response.json();
            setResults(data.notes);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, filters]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Group results by folder
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    
    results.forEach(result => {
      const folder = result.folder || 'Uncategorized';
      if (!groups[folder]) {
        groups[folder] = [];
      }
      groups[folder].push(result);
    });
    
    return groups;
  }, [results]);

  // Handle keyboard navigation in results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showFilters) return;
    
    if (e.key === "Tab") {
      e.preventDefault();
      setActiveSection(prev => 
        prev === 'results' 
          ? (recentSearches.length > 0 ? 'recent' : 'filters') 
          : prev === 'recent' ? 'filters' : 'results'
      );
    } else if (e.key === "/") {
      e.preventDefault();
      setShowFilters(prev => !prev);
    } else if (activeSection === 'results') {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      }
    } else if (activeSection === 'recent' && e.key === "Enter") {
      if (recentSearches.length > 0) {
        handleSearchClick(recentSearches[0]);
      }
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    saveRecentSearch(query);
    router.push(`/notes/${result.id || result._id}`);
    setIsOpen(false);
  };

  const handleSearchClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(dateString);
  };
  
  const toggleFilter = (type: keyof FilterOptions, value: any) => {
    setFilters(prev => {
      if (type === 'folder') {
        return { ...prev, folder: prev.folder === value ? null : value };
      } else if (type === 'timeRange') {
        return { ...prev, timeRange: value };
      } else if (type === 'onlyPinned') {
        return { ...prev, onlyPinned: !prev.onlyPinned };
      }
      return prev;
    });
  };

  const handleClearFilters = () => {
    setFilters({
      folder: null,
      timeRange: 'all',
      onlyPinned: false
    });
  };

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.folder) count++;
    if (filters.timeRange !== 'all') count++;
    if (filters.onlyPinned) count++;
    return count;
  }, [filters]);

  // Render filter UI - now with responsive design
  const renderFilters = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-gray-200"
    >
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">Search Filters</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters} 
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Folders filter */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
              <FiFolder className="mr-1.5" size={14} />
              Folders
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {availableFolders.map(folder => (
                <Badge
                  key={folder}
                  variant={filters.folder === folder ? "default" : "outline"}
                  className={`cursor-pointer text-xs sm:text-sm py-0.5 ${filters.folder === folder 
                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300' 
                    : 'hover:bg-gray-100'}`}
                  onClick={() => toggleFilter('folder', folder)}
                >
                  {folder}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Time range filter */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
              <FiCalendar className="mr-1.5" size={14} />
              Time Range
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                { value: 'all', label: 'All time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Past week' },
                { value: 'month', label: 'Past month' }
              ].map(option => (
                <Badge
                  key={option.value}
                  variant={filters.timeRange === option.value ? "default" : "outline"}
                  className={`cursor-pointer text-xs sm:text-sm py-0.5 ${filters.timeRange === option.value 
                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300' 
                    : 'hover:bg-gray-100'}`}
                  onClick={() => toggleFilter('timeRange', option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Pinned filter */}
          <div>
            <Badge
              variant={filters.onlyPinned ? "default" : "outline"}
              className={`cursor-pointer text-xs sm:text-sm py-0.5 ${filters.onlyPinned 
                ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300' 
                : 'hover:bg-gray-100'}`}
              onClick={() => toggleFilter('onlyPinned', null)}
            >
              <FiStar className="mr-1.5" size={12} />
              Only pinned notes
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render content based on state - now with responsive design
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center">
          <div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Searching...</p>
        </div>
      );
    }

    if (results.length > 0) {
      if (Object.keys(groupedResults).length > 0) {
        return (
          <div>
            <p className="px-3 sm:px-4 py-2 text-xs text-gray-500">
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </p>
            {Object.entries(groupedResults).map(([folder, folderResults]) => (
              <div key={folder} className="mb-3">
                <div className="px-3 sm:px-4 py-1 text-xs font-medium text-gray-500 flex items-center bg-slate-50">
                  <FiFolder className="mr-1.5" size={12} />
                  {folder}
                </div>
                {folderResults.map((result, resultIndex) => {
                  // Calculate the overall index in the flat results array
                  const overallIndex = results.findIndex(r => 
                    (r.id || r._id) === (result.id || result._id)
                  );
                  
                  return (
                    <div
                      key={result.id || result._id}
                      className={`px-3 sm:px-4 py-2 sm:py-3 cursor-pointer transition-colors duration-150 ${
                        selectedIndex === overallIndex 
                          ? "bg-blue-50 border-l-2 border-blue-500" 
                          : "hover:bg-gray-50 border-l-2 border-transparent"
                      }`}
                      onClick={() => handleSelectResult(result)}
                      onMouseEnter={() => setSelectedIndex(overallIndex)}
                    >
                      <div className="flex items-start">
                        <div className="mt-0.5 mr-3 text-blue-500">
                          {result.isPinned ? <FiStar /> : <FiFile />}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium text-gray-900 truncate flex items-center">
                            {result.title || "Untitled Note"}
                            {selectedIndex === overallIndex && !isMobile && (
                              <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 border rounded text-gray-500 hidden sm:inline-block">
                                Enter
                              </kbd>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {result.snippet}
                          </p>
                          <div className="flex items-center mt-1.5 flex-wrap gap-y-1">
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex items-center mr-3">
                                <FiTag className="text-gray-400 mr-1" size={12} />
                                <div className="flex gap-1 flex-wrap">
                                  {result.tags.slice(0, isMobile ? 1 : 3).map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs py-0 px-1">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {result.tags.length > (isMobile ? 1 : 3) && (
                                    <Badge variant="secondary" className="text-xs py-0 px-1">
                                      +{result.tags.length - (isMobile ? 1 : 3)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center text-xs text-gray-500">
                              <FiClock className="mr-1" size={12} />
                              {getRelativeTime(result.updatedAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      }
    }

    if (query.trim() && !isLoading) {
      return (
        <div className="p-4 sm:p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-500">No results found for "{query}"</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      );
    }

    if (recentSearches.length > 0) {
      return (
        <div>
          <p className="px-3 sm:px-4 py-2 text-xs text-gray-500">Recent searches</p>
          {recentSearches.map((term, index) => (
            <div
              key={term}
              className={`px-3 sm:px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center
                ${activeSection === 'recent' && index === 0 ? 'bg-blue-50' : ''}`}
              onClick={() => handleSearchClick(term)}
            >
              <FiClock className="text-gray-400 mr-2" size={14} />
              <span className="text-gray-700">{term}</span>
            </div>
          ))}
          <div className="px-3 sm:px-4 py-3 text-xs text-right">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => {
                setRecentSearches([]);
                localStorage.removeItem("recentSearches");
              }}
            >
              Clear history
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-8 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-gray-500">Type to search your notes</p>
        <p className="text-xs text-gray-400 mt-1">
          Search by title, content, or tags
        </p>
      </div>
    );
  };

  // Responsive search button based on screen size
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="w-full relative flex items-center justify-between text-gray-500 bg-slate-800/60 hover:bg-slate-700/70 border-slate-700 text-slate-300"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center">
          <FiSearch className="mr-1.5 sm:mr-2" />
          <span className="text-sm sm:text-base truncate">Search notes...</span>
        </div>
        <kbd className="hidden md:inline-flex items-center gap-1 rounded border bg-slate-700 px-1.5 font-mono text-xs text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    );
  }

  // Enhanced mobile UX for the search modal
  return (
    <div className="fixed inset-0 bg-gray-800/80 backdrop-blur-sm z-50 flex items-start justify-center pt-0 sm:pt-[15vh] animate-in fade-in duration-200">
      <motion.div
        ref={searchContainerRef}
        initial={{ opacity: 0, y: isMobile ? 20 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isMobile ? 20 : -20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={`w-full ${isMobile ? 'h-full' : 'max-w-2xl'}`}
      >
        <Card className={`bg-white shadow-2xl flex flex-col overflow-hidden
          ${isMobile ? 'h-full rounded-none' : 'max-h-[70vh] rounded-lg mt-4'}`}>
          {/* Header with back button for mobile */}
          <div className="p-3 flex items-center border-b">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="mr-1 -ml-1 p-1 h-8 w-8 text-gray-500"
              >
                <FiArrowLeft size={18} />
              </Button>
            )}
            <div className="p-1 text-gray-500">
              <FiSearch size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search notes..."
              className="flex-grow outline-none border-none bg-transparent px-2 py-1 text-gray-800 placeholder-gray-400 text-base"
              autoComplete="off"
            />
            <div className="flex items-center gap-1 ml-1">
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-7 h-7 p-0 flex items-center justify-center"
                  onClick={() => setQuery('')}
                >
                  <FiX size={16} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={`text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-7 h-7 p-0 flex items-center justify-center ${activeFilterCount > 0 ? 'text-blue-500 bg-blue-50' : ''}`}
                onClick={() => setShowFilters(prev => !prev)}
                title="Search filters"
              >
                {activeFilterCount > 0 ? (
                  <div className="relative">
                    <FiFilter size={16} />
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {activeFilterCount}
                    </div>
                  </div>
                ) : (
                  <FiFilter size={16} />
                )}
              </Button>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-7 h-7 p-0 flex items-center justify-center"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                >
                  <FiX size={16} />
                </Button>
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {showFilters && renderFilters()}
          </AnimatePresence>
          
          <div className="overflow-auto flex-grow">
            {renderContent()}
          </div>
          
          {/* Footer with keyboard shortcuts - hide some on mobile */}
          <Separator />
          <div className="p-2 sm:p-3 text-xs text-gray-500 flex flex-wrap justify-between items-center bg-gray-50 rounded-b-lg gap-y-1 gap-x-2">
            {!isMobile ? (
              <>
                <div className="flex items-center">
                  <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs mr-1">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">↓</kbd>
                  <span className="ml-1">Navigate</span>
                </div>
                <div>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs mr-1">/</kbd>
                  <span>Filters</span>
                </div>
                <div className="hidden sm:block">
                  <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs mr-1">Tab</kbd>
                  <span>Sections</span>
                </div>
                <div>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs mr-1">Esc</kbd>
                  <span>Close</span>
                </div>
              </>
            ) : (
              <div className="w-full flex justify-between">
                <div className="flex items-center">
                  <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs mr-1">/</kbd>
                  <span>Filters</span>
                </div>
                {!showFilters && results.length > 0 && (
                  <div>{results.length} {results.length === 1 ? 'result' : 'results'}</div>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}