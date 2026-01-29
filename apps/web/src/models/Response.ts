import mongoose, { Schema } from 'mongoose';

export interface IResponse {
  title: string;
  tag: string;
  description: string;
  editorType: 'advanced' | 'markdown';
  userId: mongoose.Types.ObjectId | string; // Add user reference
  createdAt?: Date;
  updatedAt?: Date;
}

const responseSchema = new Schema<IResponse>({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  tag: { 
    type: String, 
    required: [true, 'Tag is required'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'] 
  },
  editorType: { 
    type: String, 
    enum: ['advanced', 'markdown'],
    default: 'advanced'
  },
  userId: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true,
  // Enable optimistic concurrency control
  optimisticConcurrency: true,
  // Convert _id to id in JSON responses
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create the model or get it if it exists
const Response = mongoose.models.Response || mongoose.model<IResponse>('Response', responseSchema);

export default Response;