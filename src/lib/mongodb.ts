import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tu-uri';
const MONGODB_DB = process.env.MONGODB_DB || 'container-optimizer';

if (!MONGODB_URI) {
  throw new Error('Define la variable de entorno MONGODB_URI');
}

if (!MONGODB_DB) {
  throw new Error('Define la variable de entorno MONGODB_DB');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

interface DatabaseConnection {
  client: MongoClient;
  db: Db;
}

export async function connectToDatabase(): Promise<DatabaseConnection> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw new Error('Failed to connect to the database');
  }
}