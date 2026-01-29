import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

export interface Folder {
  _id: string;
  name: string;
  userId: string;
  color?: string;
  icon?: string;
  count?: number;
}

// Define the interface for folder counts returned from the API
interface FolderCount {
  _id: string;
  count: number;
}

interface FoldersState {
  folders: Folder[];
  loading: boolean;
  error: string | null;
  activeFolder: string;
  expandedSections: {
    folders: boolean;
    tags: boolean;
    views: boolean;
    favorites: boolean;
  };
  isEditing: string | null;
  isCreatingFolder: boolean;
  folderBeingDeleted: Folder | null;

  // Actions
  fetchFolders: (userId: string) => Promise<void>;
  createFolder: (folder: Partial<Folder>) => Promise<Folder | null>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<Folder | null>;
  deleteFolder: (id: string) => Promise<boolean>;
  setActiveFolder: (folderId: string) => void;
  toggleSection: (section: 'folders' | 'tags' | 'views' | 'favorites') => void;
  setIsEditing: (folderId: string | null) => void;
  setIsCreatingFolder: (isCreating: boolean) => void;
  setFolderBeingDeleted: (folder: Folder | null) => void;
  getFolderCounts: () => Promise<void>;
}

export const useFoldersStore = create<FoldersState>()(
  devtools(
    persist(
      (set, get) => ({
        folders: [],
        loading: false,
        error: null,
        activeFolder: '',
        expandedSections: {
          folders: true,
          tags: true,
          views: true,
          favorites: true,
        },
        isEditing: null,
        isCreatingFolder: false,
        folderBeingDeleted: null,

        fetchFolders: async (userId: string) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`/api/notes/folders?userId=${userId}`);
            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.error || 'Failed to fetch folders');
            }
            
            set({ folders: result.data, loading: false });
            
            // Also get folder counts
            get().getFolderCounts();
          } catch (err) {
            console.error('Error fetching folders:', err);
            set({ 
              error: err instanceof Error ? err.message : 'An error occurred while fetching folders',
              loading: false 
            });
          }
        },

        createFolder: async (folder: Partial<Folder>) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch('/api/notes/folders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(folder),
            });

            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.error || 'Failed to create folder');
            }
            
            const newFolder = result.data;
            set(state => ({
              folders: [...state.folders, newFolder],
              loading: false,
              isCreatingFolder: false
            }));
            
            return newFolder;
          } catch (err) {
            console.error('Error creating folder:', err);
            set({ 
              error: err instanceof Error ? err.message : 'An error occurred while creating folder',
              loading: false 
            });
            return null;
          }
        },

        updateFolder: async (id: string, updates: Partial<Folder>) => {
          // Optimistic update
          set(state => ({ 
            folders: state.folders.map(folder => 
              folder._id === id ? { ...folder, ...updates } : folder
            ),
            isEditing: null
          }));

          try {
            const response = await fetch(`/api/notes/folders/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updates),
            });

            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.error || 'Failed to update folder');
            }
            
            const updatedFolder = result.data;
            set(state => ({
              folders: state.folders.map(folder => 
                folder._id === id ? updatedFolder : folder
              )
            }));
            
            return updatedFolder;
          } catch (err) {
            console.error('Error updating folder:', err);
            // Revert optimistic update in case of error
            get().fetchFolders(get().folders[0]?.userId || '');
            set({ 
              error: err instanceof Error ? err.message : 'An error occurred while updating folder'
            });
            return null;
          }
        },

        deleteFolder: async (id: string) => {
          // Store the folder data before removing (for potential restoration)
          const folderToDelete = get().folders.find(folder => folder._id === id);
          
          // Optimistic update
          set(state => ({ 
            folders: state.folders.filter(folder => folder._id !== id),
            folderBeingDeleted: null
          }));

          try {
            const response = await fetch(`/api/notes/folders/${id}`, {
              method: 'DELETE',
            });

            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.error || 'Failed to delete folder');
            }
            
            // If this was the active folder, reset active folder
            if (get().activeFolder === id) {
              set({ activeFolder: '' });
            }
            
            return true;
          } catch (err) {
            console.error('Error deleting folder:', err);
            // Restore the deleted folder in case of API error
            if (folderToDelete) {
              set(state => ({
                folders: [...state.folders, folderToDelete],
                error: err instanceof Error ? err.message : 'An error occurred while deleting folder'
              }));
            }
            return false;
          }
        },

        setActiveFolder: (folderId: string) => set({ activeFolder: folderId }),
        
        toggleSection: (section: 'folders' | 'tags' | 'views' | 'favorites') => 
          set(state => ({ 
            expandedSections: {
              ...state.expandedSections,
              [section]: !state.expandedSections[section]
            }
          })),
        
        setIsEditing: (folderId: string | null) => set({ isEditing: folderId }),
        
        setIsCreatingFolder: (isCreating: boolean) => 
          set({ isCreatingFolder: isCreating }),
        
        setFolderBeingDeleted: (folder: Folder | null) => 
          set({ folderBeingDeleted: folder }),
          getFolderCounts: async () => {
          try {
            const response = await fetch('/api/notes/folder-counts');
            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.error || 'Failed to get folder counts');
            }
            
            const folderCounts = result.data as FolderCount[];
            
            // Update folder counts in the store
            set(state => {
              // Check if folders exists before mapping through it
              if (!state.folders) {
                console.warn('Folders array is undefined in getFolderCounts');
                return state;
              }
              
              return {
                folders: state.folders.map(folder => {
                  const count = folderCounts.find((fc: FolderCount) => fc._id === folder._id)?.count || 0;
                  return { ...folder, count };
                })
              };
            });
          } catch (err) {
            console.error('Error getting folder counts:', err);
          }
        }
      }),
      {
        name: 'folders-storage',
        storage: createJSONStorage(() => sessionStorage),
      }
    ),
    {
      name: 'Folders Store',
    }
  )
);