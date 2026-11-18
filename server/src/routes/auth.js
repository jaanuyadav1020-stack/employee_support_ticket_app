const express = require('express');
const { createAuthController } = require('../controllers/authController');

function createAuthRouter(db, authenticateToken) {
  const router = express.Router();
  const controller = createAuthController(db);

  // POST /api/auth/login - Public (no auth required)
  router.post('/login', controller.login);

  // GET /api/auth/me - Protected (requires valid JWT)
  router.get('/me', authenticateToken, controller.me);

  return router;
}

module.exports = { createAuthRouter };
