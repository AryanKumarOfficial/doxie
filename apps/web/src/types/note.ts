export type FrontendNote = {
    id: string;
    _id: string; // Keep for compatibility
    title: string;
    content: string;
    tags: string[];
    folder: string;
    color: string;
    isPinned: boolean;
    isFavorite: boolean;
    editorType: 'rich' | 'markdown' | 'simple';
    userId: string;
    isPublic: boolean;
    sharedWith: string[];
    lastAccessed: Date;
    updatedAt: Date;
    createdAt: Date;
};

// Alias for compatibility
export type INote = FrontendNote;
