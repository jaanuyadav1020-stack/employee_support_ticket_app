function authenticateUser(db) {
  return (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized: Missing x-user-id header'
      });
    }

    try {
      const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);

      if (!user) {
        return res.status(401).json({
          error: `Unauthorized: User '${userId}' not found`
        });
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Only users with role(s) [${roles.join(', ')}] can perform this action`
      });
    }

    next();
  };
}

module.exports = {
  authenticateUser,
  requireRole
};
