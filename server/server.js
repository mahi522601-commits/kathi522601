import 'dotenv/config';
import app from './src/app.js';
import { env, validateEnvironment } from './src/config/environment.js';

validateEnvironment();

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
