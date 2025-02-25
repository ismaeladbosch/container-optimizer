// src/lib/mongodb.ts
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tu-uri';
const MONGODB_DB = process.env.MONGODB_DB || 'container-optimizer';

if (!MONGODB_URI) {
  throw new Error('Define la variable de entorno MONGODB_URI');
}

if (!MONGODB_DB) {
  throw new Error('Define la variable de entorno MONGODB_DB');
}

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}