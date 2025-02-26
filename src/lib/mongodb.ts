import { MongoClient, Db } from 'mongodb';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gallardocalatayud:maricarmen1@ismael.gefdv.mongodb.net/?retryWrites=true&w=majority&appName=Ismael';
const MONGODB_DB = process.env.MONGODB_DB || 'container-optimizer';

// Verificaciones de seguridad al inicio
if (!MONGODB_URI) {
  throw new Error('Define la variable de entorno MONGODB_URI');
}

// Interfaz para conexión de base de datos
interface DatabaseConnection {
  client: MongoClient;
  db: Db;
}

// Variable para cachear la conexión
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<DatabaseConnection> {
  // Reutilizar conexión existente si está disponible
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Establecer nueva conexión
    const client = await MongoClient.connect(MONGODB_URI, {
      // Opciones de conexión para mayor estabilidad
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const db = client.db(MONGODB_DB);
    
    // Cachear la conexión
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    // Manejo de errores más detallado
    console.error('Error al conectar a la base de datos:', error);
    
    // Diferenciación de tipos de errores
    if (error instanceof Error) {
      throw new Error(`Fallo en la conexión a la base de datos: ${error.message}`);
    } else {
      throw new Error('Fallo desconocido al conectar a la base de datos');
    }
  }
}

// Función de cierre de conexión (opcional pero recomendada)
export async function closeDatabaseConnection() {
  if (cachedClient) {
    try {
      await cachedClient.close();
      cachedClient = null;
      cachedDb = null;
    } catch (error) {
      console.error('Error al cerrar la conexión de base de datos:', error);
    }
  }
}