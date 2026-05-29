import 'dotenv/config';
import app from './src/app.js';
import { env, validateEnvironment } from './src/config/environment.js';
import { adminDb, firebaseInitError } from './src/config/firebase.js';

validateEnvironment();

if (env.nodeEnv === 'production' && !adminDb) {
  throw new Error(
    firebaseInitError
      ? `Firebase Admin failed to initialize: ${firebaseInitError.message}`
      : 'Firebase Admin did not initialize in production.'
  );
}

const server = app.listen(env.port, () => {
  console.log(`Khyathi Server running on port ${env.port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${env.port} is already in use. The backend may already be running. ` +
        `Stop the old process first, or set PORT to another value in server/.env.`,
    );
    process.exit(1);
  }

  throw error;
});
