import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { produce } from 'immer';

interface UIState {
  // Navigation
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  activeView: 'recent' | 'favorites' | 'all' | 'folder' | 'tag';
  
  // View modes
  viewMode: 'grid' | 'list';
  
  // Modals and dialogs
  isPreviewDialogOpen: boolean;
  isConfirmDialogOpen: boolean;
  confirmDialogData: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null;
  previewData: any | null;

  // Search
  isSearchOpen: boolean;
  searchQuery: string;
  
  // Theme
  theme: 'light' | 'dark' | 'system';

  // UI Preferences
  editorPreference: 'advanced' | 'markdown';
  compactMode: boolean;

  // Actions
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setActiveView: (view: 'recent' | 'favorites' | 'all' | 'folder' | 'tag') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  openPreviewDialog: (data: any) => void;
  closePreviewDialog: () => void;
  openConfirmDialog: (data: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  closeConfirmDialog: () => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setEditorPreference: (preference: 'advanced' | 'markdown') => void;
  toggleCompactMode: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Navigation
        isSidebarOpen: true,
        isMobileMenuOpen: false,
        activeView: 'recent',
        
        // View modes
        viewMode: 'grid',
        
        // Modals and dialogs
        isPreviewDialogOpen: false,
        isConfirmDialogOpen: false,
        confirmDialogData: null,
        previewData: null,
        
        // Search
        isSearchOpen: false,
        searchQuery: '',
        
        // Theme
        theme: 'system',
        
        // UI Preferences
        editorPreference: 'advanced',
        compactMode: false,
        
        // Actions - Using Immer for more intuitive state updates
        toggleSidebar: () => set(
          produce((state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
          })
        ),
        
        toggleMobileMenu: () => set(
          produce((state) => {
            state.isMobileMenuOpen = !state.isMobileMenuOpen;
          })
        ),
        
        setActiveView: (view) => set(
          produce((state) => {
            state.activeView = view;
          })
        ),
        
        setViewMode: (mode) => set(
          produce((state) => {
            state.viewMode = mode;
          })
        ),
        
        openPreviewDialog: (data) => set(
          produce((state) => {
            state.isPreviewDialogOpen = true;
            state.previewData = data;
          })
        ),
        
        closePreviewDialog: () => set(
          produce((state) => {
            state.isPreviewDialogOpen = false;
            state.previewData = null;
          })
        ),
        
        openConfirmDialog: (data) => set(
          produce((state) => {
            state.isConfirmDialogOpen = true;
            state.confirmDialogData = data;
          })
        ),
        
        closeConfirmDialog: () => set(
          produce((state) => {
            state.isConfirmDialogOpen = false;
            state.confirmDialogData = null;
          })
        ),
        
        toggleSearch: () => set(
          produce((state) => {
            state.isSearchOpen = !state.isSearchOpen;
            if (!state.isSearchOpen) {
              state.searchQuery = '';
            }
          })
        ),
        
        setSearchQuery: (query) => set(
          produce((state) => {
            state.searchQuery = query;
          })
        ),
        
        setTheme: (theme) => set(
          produce((state) => {
            state.theme = theme;
          })
        ),
        
        setEditorPreference: (preference) => set(
          produce((state) => {
            state.editorPreference = preference;
          })
        ),
        
        toggleCompactMode: () => set(
          produce((state) => {
            state.compactMode = !state.compactMode;
          })
        ),
      }),
      {
        name: 'ui-storage',
        storage: createJSONStorage(() => localStorage), 
        partialize: (state) => ({
          theme: state.theme,
          editorPreference: state.editorPreference,
          compactMode: state.compactMode,
          viewMode: state.viewMode,
        }),
      }
    ),
    {
      name: 'UI Store',
    }
  )
);