const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'support-ticket-dev-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = '24h';

function createAuthController(db) {
  return {
    /**
     * POST /api/auth/login
     * Authenticate user with email and password, return JWT token
     */
    login: (req, res, next) => {
      try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || typeof email !== 'string' || !email.trim()) {
          return res.status(400).json({ error: 'Email is required' });
        }
        if (!password || typeof password !== 'string' || !password.trim()) {
          return res.status(400).json({ error: 'Password is required' });
        }

        // Look up user by email
        const user = db.prepare(
          'SELECT id, name, email, password_hash, role FROM users WHERE email = ?'
        ).get(email.trim().toLowerCase());

        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password with stored hash
        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role, name: user.name },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        // Return token and user info (never return password_hash)
        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      } catch (err) {
        next(err);
      }
    },

    /**
     * GET /api/auth/me
     * Return current authenticated user from JWT
     */
    me: (req, res) => {
      // req.user is set by authenticateToken middleware
      res.json({ user: req.user });
    }
  };
}

module.exports = { createAuthController, JWT_SECRET };
