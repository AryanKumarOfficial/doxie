import mongoose, {Schema} from 'mongoose';
import {hash} from 'bcryptjs';

export interface IUser {
    _id?: mongoose.Types.ObjectId | string;
    id?: string;
    name: string;
    email: string;
    password?: string;
    image?: string;
    authProviders?: string[];
    lastLogin?: Date;
    isVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters'],
        minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (email: string) {
                // Basic email validation regex
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: 'Invalid email format'
        },
    },
    password: {
        type: String,
        required: [function (this: IUser) {
            // Password is only required for email/password authentication
            return !this.authProviders || this.authProviders.length === 0;
        }, 'Password is required for email login'],
        minlength: [8, 'Password must be at least 8 characters'],
        // Don't let MongoDB return the password field by default
        select: false
    },
    image: {
        type: String,
        validate: {
            validator: function (url: string) {
                // Check if it's a valid URL (simple check)
                if (!url) return true; // Allow empty
                return /^(http|https):\/\/[^ "]+$/.test(url);
            },
            message: 'Invalid image URL format'
        }
    },
    authProviders: {
        type: [String],
        enum: ['github', 'google', 'credentials'],
        default: []
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password; // Ensure password is never exposed
            return ret;
        }
    }
});

// Index for efficient queries
// userSchema.index({email: 1}, {unique: true});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        try {
            this.password = await hash(this.password, 12);
        } catch (error) {
            return next(new Error('Error hashing password'));
        }
    }
    next();
});

// Update lastLogin when user logs in
userSchema.methods.updateLoginTimestamp = async function () {
    this.lastLogin = new Date();
    return this.save();
};

// Create the model or get it if it exists
const User = mongoose.models.User as mongoose.Model<IUser> || mongoose.model<IUser>('User', userSchema);

export default User;