import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { getDatastoreStatus } from './services/firestore.js';

import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import usersRouter from './routes/users.js';
import couponsRouter from './routes/coupons.js';
import cartRouter from './routes/cart.js';
import uploadRouter from './routes/upload.js';
import chatbotRouter from './routes/chatbot.js';
import contactRouter from './routes/contact.js';
import settingsRouter from './routes/settings.js';
import paymentsRouter from './routes/payments.js';

const app = express();

/* SECURITY */
app.use(helmet());

/* CORS FIX */
app.use(cors());

app.options('*', cors());

/* LOGGER */
app.use(morgan('dev'));

/* BODY PARSER */
app.use(express.json({ limit: '50mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  }),
);

/* SKIP RATE LIMIT FOR OPTIONS */
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  return rateLimiter(req, res, next);
});

/* HEALTH */
app.get('/api/health', (req, res) => {
  const datastore = getDatastoreStatus();

  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    mockStore: datastore.mockStore,
    datastore,
  });
});

/* ROUTES */
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/contact', contactRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/payments', paymentsRouter);

/* ERROR HANDLER */
app.use(errorHandler);

export default app;
