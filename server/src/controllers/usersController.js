function createUsersController(db) {
  return {
    getUsers: (req, res, next) => {
      try {
        const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY name ASC').all();
        res.json({ users });
      } catch (err) {
        next(err);
      }
    },

    getCurrentUser: (req, res) => {
      res.json({ user: req.user });
    }
  };
}

module.exports = { createUsersController };
