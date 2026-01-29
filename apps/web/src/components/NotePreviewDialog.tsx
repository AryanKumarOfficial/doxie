"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiX, FiEdit, FiFolder, FiTag, FiClock } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { INote } from "@/store/notesStore";

export function NotePreviewDialog() {
  const { isPreviewDialogOpen, previewData, closePreviewDialog } = useUIStore();
  const router = useRouter();
  
  // We'll cast to INote here since we know this is what we stored
  const note = previewData as INote | null;
  
  if (!isPreviewDialogOpen || !note) return null;

  // Handle escape key to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreviewDialog();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closePreviewDialog]);
  
  // Prevent scrolling when dialog is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleEdit = () => {
    router.push(`/notes/${note.id || note._id}`);
    closePreviewDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40" 
        onClick={closePreviewDialog}
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        transition={{ type: "spring", bounce: 0.2 }}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 z-10 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-start mb-4 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{note.title}</h2>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-1"
            >
              <FiEdit size={14} /> Edit
            </Button>
            
            <button 
              onClick={closePreviewDialog}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close preview"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center mb-4 text-sm text-gray-500">
          <div className="flex items-center mr-4">
            <FiClock className="mr-1" />
            <span>
              {formatDistanceToNow(new Date(note.updatedAt), { 
                addSuffix: true 
              })}
            </span>
          </div>
          <div className="flex items-center mr-4">
            <FiFolder className="mr-1" />
            <span>{note.folder}</span>
          </div>
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center overflow-x-auto">
              <FiTag className="mr-1 flex-shrink-0" />
              <div className="flex gap-1">
                {note.tags.map((tag) => (
                  <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 pt-4 flex-1 overflow-y-auto pr-2">
          <div className="prose max-w-none">
            {note.editorType === "rich" && (
              <div dangerouslySetInnerHTML={{ __html: note.content }} />
            )}
            
            {note.editorType === "markdown" && (
              <ReactMarkdown>{note.content}</ReactMarkdown>
            )}
            
            {note.editorType === "simple" && (
              <div className="whitespace-pre-wrap">{note.content}</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}