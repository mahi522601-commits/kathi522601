import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/environment.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import usersRouter from './routes/users.js';
import couponsRouter from './routes/coupons.js';
import uploadRouter from './routes/upload.js';
import chatbotRouter from './routes/chatbot.js';
import contactRouter from './routes/contact.js';
import settingsRouter from './routes/settings.js';
import paymentsRouter from './routes/payments.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-machine tools and approved frontends in development.
      if (!origin || env.clientUrls.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(rateLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    mockStore: env.useMockStore,
  });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/contact', contactRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/payments', paymentsRouter);

app.use(errorHandler);

export default app;
