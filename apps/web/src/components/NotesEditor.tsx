"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BareEditor from "./BareEditor";
import MarkdownEditor from "./MarkdownEditor";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { INote } from "@/models/Note";
import { FiSave, FiTag, FiShare2, FiTrash2, FiStar, FiPaperclip, FiEye, FiEdit, FiX, FiDroplet } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { showToast } from "@/lib/utils";
import { useNotesStore } from "@/store/notesStore";
import { Types } from "mongoose";

interface NotesEditorProps {
  note?: INote;
  isNew?: boolean;
  readOnly?: boolean;
}

export default function NotesEditor({ note, isNew = false, readOnly = false }: NotesEditorProps) {
  const router = useRouter();
  // Get functions from the global store
  const { updateNote, togglePinned, toggleFavorite: toggleFavoriteStore, togglePublic: togglePublicStore } = useNotesStore();
  
  const [title, setTitle] = useState(note?.title || "Untitled Note");
  const [content, setContent] = useState(note?.content || "");
  const [editorType, setEditorType] = useState<"rich" | "markdown" | "simple">(
    note?.editorType as any || "rich"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [folder, setFolder] = useState(note?.folder || "Default");
  const [isFavorite, setIsFavorite] = useState(note?.isFavorite || false);
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isPublic, setIsPublic] = useState(note?.isPublic || false);
  const [color, setColor] = useState(note?.color || "#ffffff");
  const [tagInput, setTagInput] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(readOnly);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [allFolders, setAllFolders] = useState<string[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const prevContentRef = useRef(note?.content || "");

  // Force preview mode when readOnly is true
  useEffect(() => {
    if (readOnly && !isPreviewMode) {
      setIsPreviewMode(true);
    }
  }, [readOnly]);

  // Fetch all available folders
  useEffect(() => {
    async function fetchFolders() {
      try {
        const response = await fetch("/api/notes/folders");
        if (!response.ok) throw new Error("Failed to fetch folders");

        const data = await response.json();
        setAllFolders(data.folders);
      } catch (error) {
        console.error("Error fetching folders:", error);
      } finally {
        setIsLoadingFolders(false);
      }
    }

    fetchFolders();
  }, []);

  // Get the note ID - could be either id or _id depending on how MongoDB data is processed
  const getNoteId = () => {
    if (!note) return null;
    const id = note._id || note.id;
    return typeof id === 'string' ? id : id?.toString();
  };

  // Save the note
  const saveNote = async () => {
    if (!title.trim()) {
      showToast.error("Title cannot be empty");
      return;
    }

    setIsSaving(true);

    try {
      const noteData = {
        title,
        content,
        editorType,
        tags,
        folder,
        isFavorite,
        isPinned,
        isPublic,
        color,
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };

      const noteId = getNoteId();
      const url = isNew
        ? "/api/notes"
        : `/api/notes/${noteId}`;

      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save note: ${response.status}`);
      }

      const savedNote = await response.json();
      
      // Handle both response formats - direct note or {data: note}
      const noteResult = savedNote.data || savedNote;

      if (isNew) {
        const newNoteId = noteResult._id || noteResult.id;
        if (newNoteId) {
          showToast.success("Note created successfully");
          router.replace(`/notes/${newNoteId}`);
        } else {
          throw new Error("Invalid response from server");
        }
      } else {
        showToast.success("Note saved successfully");
        // Use updateNote from the store to ensure global state is updated
        if (!isNew) {
          const noteId = getNoteId();
          if (noteId) {
            await updateNote(noteId, noteData);
          }
        }
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error saving note:", error);
      showToast.error(error.message || "Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete the note
  const deleteNote = async () => {
    const noteId = getNoteId();
    if (!noteId || isNew) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      showToast.success("Note deleted successfully", {
        icon: '🗑️',
      });
      setShowDeleteDialog(false);
      router.push("/notes");
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle adding a tag
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Toggle favorite status - use global store
  const handleToggleFavorite = async () => {
    if (isNew) {
      setIsFavorite(!isFavorite);
      return;
    }
    
    const noteId = getNoteId();
    if (!noteId) return;
    
    try {
      await toggleFavoriteStore(noteId);
      setIsFavorite(!isFavorite);
    } catch (error: any) {
      showToast.error(error.message || "Failed to update note");
    }
  };

  // Toggle pinned status - use global store
  const handleTogglePinned = async () => {
    if (isNew) {
      setIsPinned(!isPinned);
      return;
    }
    
    const noteId = getNoteId();
    if (!noteId) return;
    
    try {
      // Update local state immediately for better UX
      const newPinnedState = !isPinned;
      setIsPinned(newPinnedState);
      
      // Then update the store
      await togglePinned(noteId);
      showToast.success(`Note ${!newPinnedState ? "pinned" : "unpinned"} successfully`);
    } catch (error: any) {
      // Revert on error
      setIsPinned(isPinned);
      showToast.error(error.message || "Failed to update note");
    }
  };

  // Toggle public status - use global store
  const handleTogglePublic = async () => {
    if (isNew) {
      setIsPublic(!isPublic);
      return;
    }
    
    const noteId = getNoteId();
    if (!noteId) return;
    
    try {
      await togglePublicStore(noteId);
      setIsPublic(!isPublic);
    } catch (error: any) {
      showToast.error(error.message || "Failed to update note");
    }
  };

  // Color options
  const colorOptions = [
    { name: "White", value: "#ffffff" },
    { name: "Red", value: "#f87171" },
    { name: "Orange", value: "#fb923c" },
    { name: "Yellow", value: "#fbbf24" },
    { name: "Green", value: "#4ade80" },
    { name: "Blue", value: "#60a5fa" },
    { name: "Purple", value: "#a78bfa" },
    { name: "Pink", value: "#f472b6" },
    { name: "Gray", value: "#9ca3af" },
  ];

  // Auto-save every 30 seconds
  useEffect(() => {
    if (isNew || readOnly) return; // Don't auto-save new notes or in read-only mode

    const autoSaveInterval = setInterval(() => {
      if (note && title.trim() && content !== note.content) {
        saveNote();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [title, content, note]);

  // Determine if text color should be white or black based on background color
  const getTextColor = (bgColor: string): string => {
    // Default to black text if no color is specified or it's white
    if (!bgColor || bgColor === "#ffffff") return "text-gray-800";

    // For light colors, use dark text
    if (["#f0f8ff", "#e6e6fa", "#f5f5dc", "#ffebcd", "#ffe4c4", "#f0fff0", "#fbbf24"].includes(bgColor)) {
      return "text-gray-800";
    }

    // For darker colors, use light text
    return "text-white";
  };

  const textColor = getTextColor(color);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: color, borderRadius: '0.5rem' }}>
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-4 px-4 pt-4">
        <motion.input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`text-2xl font-bold bg-transparent border-none outline-none flex-grow ${textColor}`}
          placeholder="Note Title"
          disabled={isPreviewMode || readOnly}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        />

        <div className="flex gap-2">
          {!isNew && !readOnly && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={isPreviewMode ? "bg-blue-50 text-blue-700" : ""}
              >
                {isPreviewMode ? <FiEdit /> : <FiEye />}
              </Button>
            </motion.div>
          )}

          {!readOnly && (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={isFavorite ? "text-yellow-500 border-yellow-500" : ""}
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <FiStar />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTogglePinned}
                  className={isPinned ? "text-blue-500 border-blue-500" : ""}
                  title={isPinned ? "Unpin note" : "Pin note"}
                >
                  <FiPaperclip className={isPinned ? "transform rotate-45" : ""} />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="relative"
                  title="Change note color"
                >
                  <FiDroplet />
                  <div
                    className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  ></div>
                </Button>

                {showColorPicker && (
                  <div className="absolute z-10 mt-2 p-2 bg-white rounded-md shadow-lg border border-gray-200 grid grid-cols-3 gap-1">
                    {colorOptions.map((option) => (
                      <div
                        key={option.value}
                        className="w-6 h-6 rounded-full cursor-pointer border border-gray-300 flex items-center justify-center"
                        style={{ backgroundColor: option.value }}
                        onClick={() => {
                          setColor(option.value);
                          setShowColorPicker(false);
                        }}
                        title={option.name}
                      >
                        {color === option.value && (
                          <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}

          {!isNew && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/notes/share/${getNoteId()}`)}
                disabled={!getNoteId()}
                title="Share note"
              >
                <FiShare2 />
              </Button>
            </motion.div>
          )}

          {!readOnly && (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTogglePublic}
                  className={isPublic ? "bg-green-50 text-green-700" : ""}
                  title={isPublic ? "Make private" : "Make public"}
                >
                  {isPublic ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={saveNote}
                  disabled={isSaving || isPreviewMode}
                  className="flex items-center gap-2"
                >
                  <FiSave /> {isSaving ? "Saving..." : "Save"}
                </Button>
              </motion.div>
            </>
          )}

          {!isNew && !readOnly && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <FiTrash2 />
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {!isPreviewMode && !readOnly && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="px-4"
        >
          <Card className="p-2 mb-4">
            <div className="flex gap-2 items-center">
              <FiTag className="text-gray-500" />
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <motion.span
                    key={tag}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600 ml-1"
                    >
                      &times;
                    </button>
                  </motion.span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-grow border-none outline-none text-sm"
                placeholder="Add tags (press Enter)"
              />
            </div>
          </Card>

          <div className="flex gap-2 mb-4">
            <select
              value={editorType}
              onChange={(e) => setEditorType(e.target.value as any)}
              className="border rounded-md p-1 text-sm"
            >
              <option value="rich">Rich Text</option>
              <option value="markdown">Markdown</option>
              <option value="simple">Simple</option>
            </select>

            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="border rounded-md p-1 text-sm"
            >
              {isLoadingFolders ? (
                <option value="Default">Loading folders...</option>
              ) : (
                <>
                  <option value="Default">Default Folder</option>
                  {allFolders
                    .filter(f => f !== "Default")
                    .map(folderName => (
                      <option key={folderName} value={folderName}>{folderName}</option>
                    ))
                  }
                </>
              )}
            </select>
          </div>

          <Separator className="my-2" />
        </motion.div>
      )}

      <div className={`flex-grow overflow-auto ${!isPreviewMode && !readOnly ? "px-4 pb-4" : "p-4"}`}>
        {isPreviewMode ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-white border rounded-lg shadow-sm h-full overflow-auto"
          >
            <div className="flex items-center mb-4 justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Preview Mode</h2>
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-3">{folder}</span>
                <div className="flex">
                  {tags.map((tag) => (
                    <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs mr-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="mb-4" />

            {editorType === "rich" && (
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            )}

            {editorType === "markdown" && (
              <div className="prose max-w-none markdown-preview">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}

            {editorType === "simple" && (
              <div className="whitespace-pre-wrap">{content}</div>
            )}
          </motion.div>
        ) : (
          <>
            {editorType === "rich" && (
              <BareEditor
                value={content}
                onChange={setContent}
                placeholder="Start typing your note..."
                readOnly={readOnly}
              />
            )}
            {editorType === "markdown" && (
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Start typing in markdown..."
                readOnly={readOnly}
              />
            )}
            {editorType === "simple" && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[300px] p-3 border rounded-md resize-none"
                placeholder="Start typing your plain text note..."
                readOnly={readOnly}
              />
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showDeleteDialog && (
          <Dialog
            title="Delete Note"
            description="Are you sure you want to delete this note? This action cannot be undone."
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
          >
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="mr-2">
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteNote} disabled={isDeleting} className="flex items-center gap-2">
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>Delete</>
                )}
              </Button>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}