import 'dotenv/config';
import app from './src/app.js';
import { env, validateEnvironment } from './src/config/environment.js';

validateEnvironment();

app.listen(env.port, () => {
  console.log(`Khyathi Server running on port ${env.port}`);
});
