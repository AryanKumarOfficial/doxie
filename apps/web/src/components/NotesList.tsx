"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { FiStar, FiTag, FiFolder, FiClock, FiGrid, FiList, FiEdit, FiTrash2, FiEye, FiPaperclip } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/utils";
import { useNotesStore, INote } from "@/store/notesStore";
import { useUIStore } from "@/store/uiStore";

interface NotesListProps {
  notes: INote[];
  showViewToggle?: boolean;
}

export default function NotesList({ notes: initialNotes, showViewToggle = false }: NotesListProps) {
  // Get state and actions from Zustand store
  const { notes: allNotes, updateNote, deleteNote, togglePinned, togglePublic } = useNotesStore();
  const { viewMode, setViewMode, openPreviewDialog } = useUIStore();
  
  // Local state for UI interactions
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [displayNotes, setDisplayNotes] = useState<INote[]>([]);

  // Use effect to merge the initialNotes with the global store notes to get real-time updates
  useEffect(() => {
    if (!initialNotes || initialNotes.length === 0) {
      setDisplayNotes([]);
      return;
    }

    // For each note in the initial array, check if there's a more up-to-date version in allNotes
    const updatedNotes = initialNotes
      .filter(note => note !== null && note !== undefined)
      .map(note => {
        const id = note._id || note.id;
        const globalNote = allNotes.find(n => (n._id === id || n.id === id));
        // Use the global store version if available, as it's more up-to-date
        return globalNote || note;
      });
    
    setDisplayNotes(updatedNotes);
  }, [initialNotes, allNotes]);
  
  const router = useRouter();

  // Function to get a snippet of the content for preview
  const getContentPreview = (content: string): string => {
    // Handle undefined or null content
    if (!content) return '';
    
    // Strip HTML for rich text content
    const plainText = content.replace(/<[^>]*>/g, "");
    return plainText.length > 100 ? plainText.substring(0, 100) + "..." : plainText;
  };

  // Function to determine text color based on background color
  const getTextColor = (bgColor?: string): string => {
    // Default to black text if no color is specified or it's white
    if (!bgColor || bgColor === "#ffffff") return "text-gray-800";

    // For light colors, use dark text
    if (["#f0f8ff", "#e6e6fa", "#f5f5dc", "#ffebcd", "#ffe4c4", "#f0fff0"].includes(bgColor)) {
      return "text-gray-800";
    }

    // For darker colors, use light text
    return "text-white";
  };

  // Function to get the editor type icon
  const getEditorTypeIcon = (type: string) => {
    switch (type) {
      case 'markdown':
        return 'M';
      case 'simple':
        return 'T';
      default:
        return 'R';
    }
  };

  if (displayNotes.length === 0) {
    return <p className="text-gray-500 italic">No notes found</p>;
  }

  // Function to handle note deletion
  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    try {
      const success = await deleteNote(noteId);

      if (success) {
        showToast.success("Note deleted successfully", {
          icon: '🗑️',
        });
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete note");
    } finally {
      setShowDeleteDialog(null);
    }
  };

  // Function to open edit page directly
  const handleEditNote = (noteId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation
    e.stopPropagation(); // Prevent event bubbling
    router.push(`/notes/${noteId}`);
  };

  // Function to toggle pin status
  const handleTogglePin = async (noteId: string, isPinned: boolean, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    try {
      // Use the store's togglePinned function directly
      await togglePinned(noteId);
      showToast.success(`Note ${isPinned ? "unpinned" : "pinned"} successfully`);
    } catch (error: any) {
      showToast.error(error.message || "Failed to update note");
    }
  };

  // Function to toggle public status
  const handleTogglePublic = async (noteId: string, isPublic: boolean, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    try {
      // Use the store's togglePublic function directly
      await togglePublic(noteId);
      showToast.success(`Note is now ${isPublic ? "private" : "public"}`);
    } catch (error: any) {
      showToast.error(error.message || "Failed to update note visibility");
    }
  };

  // Function to handle preview dialog
  const handlePreview = (note: INote, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openPreviewDialog(note);
  };

  // Check if we have any displayNotes, if not, fall back to initialNotes
  const notesToRender = displayNotes.length > 0 ? displayNotes : initialNotes;

  return (
    <div>
      {showViewToggle && (
        <motion.div
          className="flex justify-end mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex border rounded-md overflow-hidden shadow-sm">
            <motion.button
              whileHover={{ backgroundColor: viewMode === 'grid' ? '#dbeafe' : '#f9fafb' }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100' : 'bg-white'}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <FiGrid />
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: viewMode === 'list' ? '#dbeafe' : '#f9fafb' }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100' : 'bg-white'}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <FiList />
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}`}>
        <AnimatePresence>
          {notesToRender.filter(note => note && note._id).map((note) => {
            const id = note.id || note._id;
            const isHovered = hoveredNoteId === id;
            const textColor = getTextColor(note?.color);

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => setHoveredNoteId(id)}
                onMouseLeave={() => setHoveredNoteId(null)}
              >
                <Link href={`/notes/${id}`}>
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`
                      h-full border p-4 transition-all
                      ${viewMode === "list" ? "flex gap-4" : "flex flex-col"}
                      ${isHovered ? "border-blue-300" : "border-gray-200"}
                      relative
                    `}
                      style={{
                        backgroundColor: note.color || "#ffffff"
                      }}
                    >
                      {/* Status indicators */}
                      <div className="absolute top-1 left-1 flex gap-1">
                        {note.isPinned && (
                          <div className="transform rotate-45 text-gray-500" title="Pinned note">
                            <FiPaperclip size={14} />
                          </div>
                        )}
                        {note.isPublic && (
                          <div className="text-green-600" title="Public note">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </div>
                        )}
                        {note.sharedWith && note.sharedWith.length > 0 && (
                          <div className="text-blue-600" title={`Shared with ${note.sharedWith.length} people`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Editor type indicator */}
                      <div className="absolute top-1 right-1 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-[10px]" title={`${note.editorType} editor`}>
                        {getEditorTypeIcon(note.editorType)}
                      </div>

                      {/* Actions overlay - only visible on hover */}
                      {isHovered && (
                        <div className="absolute top-8 right-2 flex gap-1 bg-white/90 p-1 rounded-md shadow-sm">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handlePreview(note, e)}
                            className="p-1 text-gray-600 hover:text-blue-600 rounded"
                            title="Preview"
                          >
                            <FiEye size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleTogglePin(id, note.isPinned, e)}
                            className={`p-1 rounded ${note.isPinned ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                            title={note.isPinned ? "Unpin" : "Pin"}
                          >
                            <FiPaperclip size={16} className={note.isPinned ? "transform rotate-45" : ""} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleTogglePublic(id, Boolean(note.isPublic), e)}
                            className={`p-1 rounded ${note.isPublic ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}
                            title={note.isPublic ? "Make Private" : "Make Public"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleEditNote(id, e)}
                            className="p-1 text-gray-600 hover:text-green-600 rounded"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowDeleteDialog(id);
                            }}
                            className="p-1 text-gray-600 hover:text-red-600 rounded"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </motion.button>
                        </div>
                      )}

                      {/* Note content */}
                      <div className={`${viewMode === "list" ? "flex-1" : "mt-4"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-medium line-clamp-1 ${textColor}`}>{note.title}</h3>
                          <div className="flex items-center gap-1">
                            {note.isFavorite &&
                              <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: [0, 15, 0, -15, 0] }}
                                transition={{
                                  duration: 0.5,
                                  ease: "easeInOut",
                                  times: [0, 0.2, 0.5, 0.8, 1],
                                  delay: 0.3,
                                  repeatDelay: 5
                                }}
                              >
                                <FiStar className="text-yellow-500" />
                              </motion.div>
                            }
                          </div>
                        </div>

                        <p className={`text-sm mb-3 line-clamp-2 ${textColor} ${textColor === "text-white" ? "opacity-90" : "text-gray-600"}`}>
                          {getContentPreview(note.content)}
                        </p>
                      </div>

                      {/* Note metadata */}
                      <div className={`
                        mt-auto text-xs ${textColor === "text-white" ? "text-white opacity-80" : "text-gray-500"}
                        ${viewMode === "list" ? "min-w-[180px]" : ""}
                      `}>
                        <div className="flex items-center gap-1 mb-1">
                          <FiClock className={textColor === "text-white" ? "text-white opacity-70" : "text-gray-400"} />
                          <span>
                            {formatDistanceToNow(new Date(note.updatedAt), {
                              addSuffix: true
                            })}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-1">
                          <FiFolder className={textColor === "text-white" ? "text-white opacity-70" : "text-gray-400"} />
                          <span>{note.folder}</span>
                        </div>

                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <FiTag className={textColor === "text-white" ? "text-white opacity-70" : "text-gray-400"} />
                            <div className="overflow-hidden">
                              {note.tags.slice(0, 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className={`mr-1 px-1 rounded text-xs ${textColor === "text-white"
                                      ? "bg-white bg-opacity-20 text-white"
                                      : "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                  {tag}
                                </span>
                              ))}
                              {note.tags.length > 3 && <span>+{note.tags.length - 3}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium mb-2">Delete Note</h3>
            <p className="text-gray-500 mb-4">Are you sure you want to delete this note? This action cannot be undone.</p>

            <div className="flex justify-end gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700"
                onClick={() => setShowDeleteDialog(null)}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#dc2626" }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-md bg-red-600 text-white"
                onClick={(e) => handleDeleteNote(showDeleteDialog, e)}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}