const express = require('express');

function createUsersRouter(db) {
  const router = express.Router();

  // GET /api/users - List all users (for switcher and attribution)
  router.get('/', (req, res, next) => {
    try {
      const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY name ASC').all();
      res.json({ users });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/users/me - Get current user profile
  router.get('/me', (req, res) => {
    res.json({ user: req.user });
  });

  return router;
}

module.exports = { createUsersRouter };
