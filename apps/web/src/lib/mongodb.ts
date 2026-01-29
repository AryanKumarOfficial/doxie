import mongoose, {ConnectOptions, Mongoose} from 'mongoose';

// Extend global to cache connection in development
declare global {
    // eslint-disable-next-line no-var
    var mongooseGlobal: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
    };
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Environment variable MONGODB_URI must be defined');
}

// Use a global variable so that the value is preserved across module reloads in development
const globalCache = globalThis.mongooseGlobal || (globalThis.mongooseGlobal = {conn: null, promise: null});

/**
 * Connect to MongoDB using Mongoose, with connection caching for serverless environments.
 * @returns {Promise<Mongoose>} The Mongoose instance.
 */
export async function connectToDatabase(): Promise<Mongoose> {
    // Return cached connection if available and still connected
    if (globalCache.conn && globalCache.conn.connection.readyState === 1) {
        return globalCache.conn;
    }

    // Create new promise if not existing
    if (!globalCache.promise) {
        const options: ConnectOptions = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
            minPoolSize: 1,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
        };

        globalCache.promise = mongoose.connect(MONGODB_URI, options)
            .then((mongooseInstance) => {
                const {connection} = mongooseInstance;

                connection.on('connected', () => {
                    console.info('[MongoDB] Connected');
                });

                connection.on('error', (err) => {
                    console.error('[MongoDB] Connection error:', err);
                });

                connection.on('disconnected', () => {
                    console.warn('[MongoDB] Disconnected, retrying...');
                    globalCache.conn = null;
                    globalCache.promise = null;
                });

                // Handle Node process termination
                process.once('SIGINT', async () => {
                    await mongooseInstance.disconnect();
                    console.info('[MongoDB] Disconnected on app termination');
                    process.exit(0);
                });

                return mongooseInstance;
            })
            .catch((error) => {
                console.error('[MongoDB] Initial connection error:', error);
                globalCache.promise = null;
                throw error;
            });
    }

    globalCache.conn = await globalCache.promise;
    return globalCache.conn;
}

export default connectToDatabase;
