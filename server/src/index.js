require('dotenv').config();
const { getDb } = require('./db');
const { createApp } = require('./app');

const PORT = process.env.PORT || 5000;
const db = getDb();
const app = createApp(db);

const server = app.listen(PORT, () => {
  console.log(`Support Ticket API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server process terminated');
  });
});
