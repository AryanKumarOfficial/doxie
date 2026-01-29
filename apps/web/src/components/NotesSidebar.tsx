"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiTag, FiFilter, FiStar, FiPaperclip, FiClock, FiChevronDown, FiChevronUp, FiX, FiFolder, FiArrowLeft } from "react-icons/fi";
import { showToast } from "@/lib/utils";

export interface NotesSidebarProps {
  toggleSidebarRef?: React.MutableRefObject<(() => void) | null>;
}

function NotesSidebarComponent({ toggleSidebarRef }: NotesSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tags, setTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    views: true,
    folders: true,
    tags: true,
    filters: true,
  });
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [isMobileVisible, setIsMobileVisible] = useState(false);

  // Calculate total notes with better null check
  const totalNotes = (() => {
    if (!folderCounts || typeof folderCounts !== 'object') return 0;
    return Object.values(folderCounts).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
  })();

  // Safe search params access
  const getSearchParam = (key: string): string | null => {
    try {
      return searchParams?.get(key) || null;
    } catch (error) {
      console.error(`Error accessing search param ${key}:`, error);
      return null;
    }
  };

  const currentTagFilter = getSearchParam('tag');
  const currentFolderFilter = getSearchParam('folder');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobileVisible(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch("/api/notes/search?tagsOnly=true");
        if (!response.ok) throw new Error("Failed to fetch tags");

        const data = await response.json();
        setTags(data.tags || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
        showToast.error("Failed to load tags");
      } finally {
        setIsLoadingTags(false);
      }
    }

    fetchTags();
  }, []);

  useEffect(() => {
    async function fetchFolders() {
      try {
        const response = await fetch("/api/notes/folders");
        if (!response.ok) throw new Error("Failed to fetch folders");

        const data = await response.json();
        setFolders(data.folders || []);
      } catch (error) {
        console.error("Error fetching folders:", error);
        showToast.error("Failed to load folders");
      } finally {
        setIsLoadingFolders(false);
      }
    }

    fetchFolders();
  }, []);

  useEffect(() => {
    // Add error handling for folder counts
    async function fetchFolderCounts() {
      try {
        const response = await fetch("/api/notes/folder-counts");
        if (!response.ok) throw new Error("Failed to fetch folder counts");

        const data = await response.json();
        setFolderCounts(data.counts || {});
      } catch (error) {
        console.error("Error fetching folder counts:", error);
        setFolderCounts({}); // Set empty object on error
      }
    }

    fetchFolderCounts();

    const intervalId = setInterval(fetchFolderCounts, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const applyFilter = (param: string, value: string) => {
    try {
      // Create a fresh URLSearchParams object from the current URL search params
      const params = new URLSearchParams(searchParams?.toString() || "");

      // Set the new parameter
      params.set(param, value);

      // Use the correct route based on current page
      if (pathname?.includes('/notes/all')) {
        // For /notes/all page
        router.push(`/notes/all?${params.toString()}`);
      } else {
        // For other notes pages (mainly /notes)
        router.push(`/notes?${params.toString()}`);
      }
    } catch (error) {
      console.error(`Error applying filter ${param}=${value}:`, error);
      showToast.error("Failed to apply filter. Please try again.");
    }
  };

  const clearFilter = (param: string) => {
    try {
      // Create a fresh URLSearchParams object from the current URL search params
      const params = new URLSearchParams(searchParams?.toString() || "");

      // Remove the parameter
      params.delete(param);

      // Use the correct route based on current page
      if (pathname?.includes('/notes/all')) {
        router.push(`/notes/all?${params.toString()}`);
      } else {
        router.push(`/notes?${params.toString()}`);
      }
    } catch (error) {
      console.error(`Error clearing filter ${param}:`, error);
      showToast.error("Failed to clear filter. Please try again.");
    }
  };

  const isViewActive = (view: string) => {
    try {
      if (view === 'all' && pathname?.includes('/notes/all')) return true;
      if (view === 'favorites' && getSearchParam('isFavorite') === 'true') return true;
      if (view === 'pinned' && getSearchParam('isPinned') === 'true') return true;
      if (view === 'recent' && getSearchParam('sort') === '-lastAccessed') return true;
      return false;
    } catch (error) {
      console.error("Error in isViewActive:", error);
      return false;
    }
  };

  const handleFolderClick = (folderName: string) => {
    if (folderName === "All Notes") {
      // For "All Notes", remove the folder parameter
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.delete('folder');

      // Keep the same base path
      if (pathname.includes('/notes/all')) {
        router.push(`/notes/all?${params.toString()}`);
      } else {
        router.push(`/notes?${params.toString()}`);
      }
    } else {
      // For specific folders, use the applyFilter function
      applyFilter('folder', folderName);
    }

    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setIsMobileVisible(false);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileVisible(!isMobileVisible);
  };

  useEffect(() => {
    if (toggleSidebarRef) {
      toggleSidebarRef.current = toggleMobileSidebar;
    }
  }, [toggleSidebarRef]);

  const SidebarContent = () => (
    <>
      <div className="mb-6">
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('views')}
        >
          <h3 className="text-sm font-medium text-gray-600">VIEWS</h3>
          {expandedSections.views ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>

        <AnimatePresence>
          {expandedSections.views && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pl-1">
                <div
                  onClick={() => router.push('/notes/all')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${isViewActive('all') ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <FiFilter className="mr-2" />
                  All Notes
                </div>
                <div
                  onClick={() => applyFilter('isFavorite', 'true')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${isViewActive('favorites') ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <FiStar className="mr-2" />
                  Favorites
                </div>
                <div
                  onClick={() => applyFilter('isPinned', 'true')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${isViewActive('pinned') ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <FiPaperclip className="mr-2" />
                  Pinned
                </div>
                <div
                  onClick={() => applyFilter('sort', '-lastAccessed')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${isViewActive('recent') ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <FiClock className="mr-2" />
                  Recent
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-6">
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('folders')}
        >
          <h3 className="text-sm font-medium text-gray-600">FOLDERS</h3>
          {expandedSections.folders ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>

        <AnimatePresence>
          {expandedSections.folders && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {isLoadingFolders ? (
                <div className="animate-pulse space-y-2 pl-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : (
                <div className="space-y-1 pl-1">
                  <div
                    onClick={() => handleFolderClick("All Notes")}
                    className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer ${!currentFolderFilter ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex items-center">
                      <FiFolder className="mr-2" />
                      <span>All Notes</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {totalNotes}
                    </span>
                  </div>
                  {folders.length > 0 ? (
                    folders.map((folder, index) => (
                      <div
                        key={index}
                        onClick={() => handleFolderClick(folder)}
                        className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer ${currentFolderFilter === folder ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <div className="flex items-center">
                          <FiFolder className="mr-2" />
                          <span>{folder}</span>
                        </div>
                        <span className="text-xs text-gray-500">{folderCounts[folder] || 0}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 pl-2">No folders found</p>
                  )}
                </div>
              )}

              {currentFolderFilter && (
                <button
                  onClick={() => clearFilter('folder')}
                  className="mt-2 text-xs text-blue-600 hover:underline pl-3 flex items-center"
                >
                  <FiX className="mr-1" /> Clear folder filter
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-6">
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('tags')}
        >
          <h3 className="text-sm font-medium text-gray-600">TAGS</h3>
          {expandedSections.tags ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>

        <AnimatePresence>
          {expandedSections.tags && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {isLoadingTags ? (
                <div className="animate-pulse space-y-2 pl-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : tags.length > 0 ? (
                <div className="space-y-1 pl-1">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      onClick={() => applyFilter('tag', tag)}
                      className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${currentTagFilter === tag ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <FiTag className="mr-2" />
                      {tag}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 pl-2">No tags found</p>
              )}

              {currentTagFilter && (
                <button
                  onClick={() => clearFilter('tag')}
                  className="mt-2 text-xs text-blue-600 hover:underline pl-3 flex items-center"
                >
                  <FiX className="mr-1" /> Clear tag filter
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-6">
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('filters')}
        >
          <h3 className="text-sm font-medium text-gray-600">FILTERS</h3>
          {expandedSections.filters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>

        <AnimatePresence>
          {expandedSections.filters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pl-1">
                <div
                  onClick={() => applyFilter('editorType', 'rich')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${searchParams?.get('editorType') === 'rich' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full text-[10px] mr-2">R</span>
                  Rich Text Notes
                </div>
                <div>
                  <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full text-[10px] mr-2">T</span>
                  Plain Text Notes
                </div>
                <div
                  onClick={() => applyFilter('isPublic', 'true')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${searchParams?.get('isPublic') === 'true' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Public Notes
                </div>
                <div
                  onClick={() => applyFilter('hasShares', 'true')}
                  className={`flex items-center py-1 px-2 text-sm rounded-md cursor-pointer ${searchParams?.get('hasShares') === 'true' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Shared Notes
                </div>
              </div>

              {(searchParams?.has('editorType') || searchParams?.has('isPublic') || searchParams?.has('hasShares')) && (
                <button
                  onClick={() => {
                    clearFilter('editorType');
                    clearFilter('isPublic');
                    clearFilter('hasShares');
                  }}
                  className="mt-2 text-xs text-blue-600 hover:underline pl-3 flex items-center"
                >
                  <FiX className="mr-1" /> Clear filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar - always visible on md screens and larger */}
      <div className="hidden md:block md:w-64 border-r p-4 bg-white h-full overflow-y-auto">
        <SidebarContent />
      </div>

      {/* Mobile sidebar - conditionally visible */}
      <AnimatePresence>
        {isMobileVisible && (
          <>
            {/* Backdrop/overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={toggleMobileSidebar}
            />

            {/* Slide-in sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 w-64 md:hidden h-full bg-white shadow-lg overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold">Notes</h2>
                  <button
                    onClick={toggleMobileSidebar}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label="Close Sidebar"
                  >
                    <FiArrowLeft size={20} />
                  </button>
                </div>
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-32 w-full max-w-md bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}

export default function NotesSidebar({ toggleSidebarRef }: NotesSidebarProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <NotesSidebarComponent toggleSidebarRef={toggleSidebarRef} />
    </Suspense>
  );
}