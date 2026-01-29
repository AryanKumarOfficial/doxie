import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface INote {
  _id: string;
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: string;
  lastAccessed: string;
  editorType: string;
  color?: string;
  isPublic?: boolean;
  sharedWith?: string[];
  userId?: string;
}

interface NotesState {
  notes: INote[];
  loading: boolean;
  error: string | null;
  currentNote: INote | null;
  searchQuery: string;
  activeFolder: string;
  activeTags: string[];
  sortBy: 'updated' | 'title' | 'created';
  
  // Actions
  fetchNotes: (userId: string) => Promise<void>;
  createNote: (note: Partial<INote>, userId: string) => Promise<INote | null>;
  updateNote: (id: string, updates: Partial<INote>) => Promise<INote | null>;
  deleteNote: (id: string) => Promise<boolean>;
  setCurrentNote: (note: INote | null) => void;
  toggleFavorite: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
  togglePublic: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setActiveFolder: (folder: string) => void;
  setActiveTags: (tags: string[]) => void;
  setSortBy: (sort: 'updated' | 'title' | 'created') => void;
  clearNotes: () => void;
}

// Create store with middleware in the correct order
export const useNotesStore = create<NotesState>()(
  devtools(
    persist(
      immer((set, get) => ({
        notes: [],
        loading: false,
        error: null,
        currentNote: null,
        searchQuery: '',
        activeFolder: 'All Notes',
        activeTags: [],
        sortBy: 'updated',

        fetchNotes: async (userId: string) => {
          set(state => {
            state.loading = true;
            state.error = null;
          });
          
          try {
            const response = await fetch(`/api/notes?userId=${userId}`);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch notes: ${response.status}`);
            }
            
            const result = await response.json();
            
            set(state => {
              state.notes = result.notes || [];
              state.loading = false;
            });
          } catch (err) {
            console.error('Error fetching notes:', err);
            set(state => {
              state.error = err instanceof Error ? err.message : 'An error occurred while fetching notes';
              state.loading = false;
            });
          }
        },

        createNote: async (note: Partial<INote>, userId: string) => {
          set(state => {
            state.loading = true;
            state.error = null;
          });
          
          try {
            const response = await fetch('/api/notes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ...note, userId }),
            });

            if (!response.ok) {
              throw new Error(`Failed to create note: ${response.status}`);
            }
            
            const result = await response.json();
            const newNote = result.data;
            
            set(state => {
              state.notes.push(newNote);
              state.loading = false;
              state.currentNote = newNote;
            });
            
            return newNote;
          } catch (err) {
            console.error('Error creating note:', err);
            set(state => {
              state.error = err instanceof Error ? err.message : 'An error occurred while creating note';
              state.loading = false;
            });
            return null;
          }
        },

        updateNote: async (id: string, updates: Partial<INote>) => {
          // Make a backup of the note for rollback
          const originalNote = get().notes.find(note => note._id === id || note.id === id);
          
          // Optimistic update
          set(state => {
            state.loading = true;
            state.error = null;
            
            // Find and update the note in state
            const noteIndex = state.notes.findIndex(note => note._id === id || note.id === id);
            if (noteIndex !== -1) {
              // Merge the updates with current note
              Object.assign(state.notes[noteIndex], updates);
            }
          });

          try {
            const response = await fetch(`/api/notes/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error(`Failed to update note: ${response.status}`);
            }
            
            const result = await response.json();
            const updatedNote = result.data;
            
            set(state => {
              // Update state with server response
              const noteIndex = state.notes.findIndex(note => note._id === id || note.id === id);
              if (noteIndex !== -1) {
                state.notes[noteIndex] = updatedNote;
              }
              
              // Update current note if it's the one being updated
              if (state.currentNote && (state.currentNote._id === id || state.currentNote.id === id)) {
                state.currentNote = updatedNote;
              }
              
              state.loading = false;
            });
            
            return updatedNote;
          } catch (err) {
            console.error('Error updating note:', err);
            
            // Revert the optimistic update on error
            set(state => {
              state.error = err instanceof Error ? err.message : 'An error occurred while updating note';
              state.loading = false;
              
              // Revert the change using the backup if available
              if (originalNote) {
                const noteIndex = state.notes.findIndex(note => note._id === id || note.id === id);
                if (noteIndex !== -1) {
                  state.notes[noteIndex] = originalNote;
                }
                
                // Revert current note if applicable
                if (state.currentNote && (state.currentNote._id === id || state.currentNote.id === id)) {
                  state.currentNote = originalNote;
                }
              }
            });
            
            return null;
          }
        },

        deleteNote: async (id: string) => {
          // Make a backup of the note and its position for rollback
          const originalNote = get().notes.find(note => note._id === id || note.id === id);
          const noteIndex = get().notes.findIndex(note => note._id === id || note.id === id);
          
          // Optimistic delete
          set(state => {
            state.loading = true;
            state.error = null;
            
            // Remove from notes array
            state.notes = state.notes.filter(note => note._id !== id && note.id !== id);
            
            // Clear current note if it's the one being deleted
            if (state.currentNote && (state.currentNote._id === id || state.currentNote.id === id)) {
              state.currentNote = null;
            }
          });

          try {
            const response = await fetch(`/api/notes/${id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error(`Failed to delete note: ${response.status}`);
            }
            
            set(state => {
              state.loading = false;
            });
            
            return true;
          } catch (err) {
            console.error('Error deleting note:', err);
            
            // Restore the deleted note on error
            set(state => {
              state.error = err instanceof Error ? err.message : 'An error occurred while deleting note';
              state.loading = false;
              
              // Restore the deleted note if backup exists
              if (originalNote && noteIndex !== -1) {
                state.notes.splice(noteIndex, 0, originalNote);
              }
            });
            
            return false;
          }
        },

        setCurrentNote: (note: INote | null) => set(state => {
          state.currentNote = note;
        }),
        
        toggleFavorite: async (id: string) => {
          const note = get().notes.find(n => n._id === id || n.id === id);
          if (!note) return;
          
          const updatedIsFavorite = !note.isFavorite;
          await get().updateNote(id, { isFavorite: updatedIsFavorite });
        },

        togglePinned: async (id: string) => {
          const note = get().notes.find(n => n._id === id || n.id === id);
          if (!note) return;
          
          const updatedIsPinned = !note.isPinned;
          await get().updateNote(id, { isPinned: updatedIsPinned });
        },

        togglePublic: async (id: string) => {
          const note = get().notes.find(n => n._id === id || n.id === id);
          if (!note) return;
          
          const updatedIsPublic = !note.isPublic;
          await get().updateNote(id, { isPublic: updatedIsPublic });
        },

        setSearchQuery: (query: string) => set(state => {
          state.searchQuery = query;
        }),
        
        setActiveFolder: (folder: string) => set(state => {
          state.activeFolder = folder;
        }),
        
        setActiveTags: (tags: string[]) => set(state => {
          state.activeTags = tags;
        }),
        
        setSortBy: (sort: 'updated' | 'title' | 'created') => set(state => {
          state.sortBy = sort;
        }),
        
        clearNotes: () => set(state => {
          state.notes = [];
          state.currentNote = null;
        }),
      })),
      {
        name: 'notes-storage',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          // Only persist these fields
          notes: state.notes,
          activeFolder: state.activeFolder,
          activeTags: state.activeTags,
          sortBy: state.sortBy,
        }),
      }
    ),
    { name: 'NotesStore' }
  )
);