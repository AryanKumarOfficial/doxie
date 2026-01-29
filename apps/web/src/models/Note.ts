import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import validator from 'validator';

// 1. Strongly typed interface with TypeScript improvements
export interface INote extends Document {
    title: string;
    content: string;
    tags: string[];
    folder: string;
    color: string;
    isPinned: boolean;
    isFavorite: boolean;
    editorType: 'rich' | 'markdown' | 'simple';
    userId: string; // Changed to string for Postgres compatibility
    isPublic: boolean;
    sharedWith: string[];
    lastAccessed: Date;
    createdAt: Date;
    updatedAt: Date;
}

// 2. Enhanced schema with robust validation and indexes
const noteSchema = new Schema<INote>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
            minlength: [1, 'Title cannot be empty']
        },
        content: {
            type: String,
            default: ''
        },
        tags: {
            type: [String],
            default: [],
            validate: [
                {
                    validator: (tags: string[]) => tags.length <= 50,
                    message: 'Cannot have more than 50 tags'
                },
                {
                    validator: (tags: string[]) =>
                        tags.every(tag => tag.length >= 1 && tag.length <= 20),
                    message: 'Tags must be 1-20 characters'
                }
            ]
        },
        folder: {
            type: String,
            default: 'Default',
            trim: true,
            maxlength: [30, 'Folder name cannot exceed 30 characters']
        },
        color: {
            type: String,
            default: '#ffffff',
            validate: {
                validator: (color: string) =>
                    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
                    ['white', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink', 'gray'].includes(color.toLowerCase()),
                message: 'Invalid color format - use hex code or predefined name'
            }
        },
        isPinned: { type: Boolean, default: false },
        isFavorite: { type: Boolean, default: false },
        editorType: {
            type: String,
            enum: {
                values: ['rich', 'markdown', 'simple'],
                message: 'Invalid editor type. Use: rich, markdown, or simple'
            },
            default: 'rich'
        },
        userId: {
            type: String, // Changed to String to store Postgres CUID
            required: [true, 'User ID is required'],
            index: true
        },
        isPublic: { type: Boolean, default: false, index: true },
        sharedWith: {
            type: [String],
            default: [],
            validate: [
                {
                    validator: (emails: string[]) => emails.length <= 100,
                    message: 'Cannot share with more than 100 users'
                },
                {
                    validator: (emails: string[]) =>
                        emails.every(email => validator.isEmail(email)),
                    message: 'Invalid email format in sharedWith'
                }
            ]
        },
        lastAccessed: { type: Date, default: Date.now, index: true }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        },
        toObject: { virtuals: true }
    }
);

// 3. Optimized indexes for common query patterns
noteSchema.index({
    title: 'text',
    content: 'text',
    tags: 'text'
}, {
    weights: { title: 3, tags: 2, content: 1 },
    name: 'note_search_index'
});

noteSchema.index({ userId: 1, updatedAt: -1 }); // Primary user feed
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ userId: 1, isFavorite: -1, updatedAt: -1 });
noteSchema.index({ userId: 1, folder: 1, updatedAt: -1 });
noteSchema.index({ isPublic: 1, updatedAt: -1 }); // Public notes discovery

// 4. Model creation with Next.js hot reload support
const Note: Model<INote> =
    mongoose.models?.Note as Model<INote> ||
    mongoose.model<INote>('Note', noteSchema);

export default Note;