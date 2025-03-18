import { MongoClient, Db } from 'mongodb';

// Asegurarnos de que la URI se establece correctamente
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tu-uri';
const MONGODB_DB = process.env.MONGODB_DB || 'container-optimizer';

// Validación de configuración
if (!MONGODB_URI) {
  throw new Error('Define la variable de entorno MONGODB_URI');
}

if (!MONGODB_DB) {
  throw new Error('Define la variable de entorno MONGODB_DB');
}

// Cache de la conexión
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

interface DatabaseConnection {
  client: MongoClient;
  db: Db;
}

export async function connectToDatabase(): Promise<DatabaseConnection> {
  // Si ya tenemos una conexión, la reutilizamos
  if (cachedClient && cachedDb) {
    console.log("Usando conexión en caché a MongoDB");
    return { client: cachedClient, db: cachedDb };
  }

  console.log("Estableciendo nueva conexión a MongoDB");
  
  try {
    // Opciones para evitar advertencias de deprecación
    const options = {
      // @ts-ignore - Options may vary by MongoDB client version
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Conectar al cliente
    const client = await MongoClient.connect(MONGODB_URI, options);
    const db = client.db(MONGODB_DB);
    
    console.log("Conexión a MongoDB establecida exitosamente");
    
    // Almacenar en caché para futuras conexiones
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw new Error('Failed to connect to the database');
  }
}