const express = require('express');
const { createUsersController } = require('../controllers/usersController');

function createUsersRouter(db) {
  const router = express.Router();
  const controller = createUsersController(db);

  // 1. GET /api/users - List all users
  router.get('/', controller.getUsers);

  // 2. GET /api/users/me - Get current user profile
  router.get('/me', controller.getCurrentUser);

  return router;
}

module.exports = { createUsersRouter };
