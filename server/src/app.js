const express = require('express');
const cors = require('cors');
const { authenticateUser } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { createUsersRouter } = require('./routes/users');
const { createTicketsRouter } = require('./routes/tickets');
const { createCommentsRouter } = require('./routes/comments');

function createApp(db) {
  const app = express();

  // Core Middlewares
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });

  // Users routes (listing is open for role switching, /me is authenticated)
  const usersRouter = createUsersRouter(db);
  app.use('/api/users', (req, res, next) => {
    if (req.path === '/me') {
      return authenticateUser(db)(req, res, next);
    }
    next();
  }, usersRouter);

  // Authenticated domain routes
  const authMiddleware = authenticateUser(db);
  const ticketsRouter = createTicketsRouter(db);
  const commentsRouter = createCommentsRouter(db);

  app.use('/api/tickets', authMiddleware, ticketsRouter);
  app.use('/api/tickets/:ticketId/comments', authMiddleware, commentsRouter);

  // 404 Fallback
  app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
