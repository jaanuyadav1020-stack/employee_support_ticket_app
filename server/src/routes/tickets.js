const express = require('express');
const { requireRole } = require('../middleware/auth');

const VALID_CATEGORIES = ['Hardware', 'Software', 'Network', 'Facilities', 'Access & Accounts', 'Other'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const VALID_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

function createTicketsRouter(db) {
  const router = express.Router();

  // GET /api/tickets - List tickets according to role & optional filters
  router.get('/', (req, res, next) => {
    try {
      const { role, id: userId } = req.user;
      const { status, priority, category } = req.query;

      let query = `
        SELECT 
          t.id,
          t.title,
          t.description,
          t.category,
          t.priority,
          t.status,
          t.created_by,
          t.created_at,
          t.updated_at,
          u.name AS creator_name,
          u.email AS creator_email,
          (SELECT COUNT(*) FROM comments c WHERE c.ticket_id = t.id) AS comment_count
        FROM tickets t
        JOIN users u ON t.created_by = u.id
        WHERE 1=1
      `;
      const params = [];

      // Role visibility rule: Employees can only see their own tickets
      if (role === 'EMPLOYEE') {
        query += ` AND t.created_by = ?`;
        params.push(userId);
      }

      // Optional filters
      if (status && VALID_STATUSES.includes(status)) {
        query += ` AND t.status = ?`;
        params.push(status);
      }

      if (priority && VALID_PRIORITIES.includes(priority)) {
        query += ` AND t.priority = ?`;
        params.push(priority);
      }

      if (category && VALID_CATEGORIES.includes(category)) {
        query += ` AND t.category = ?`;
        params.push(category);
      }

      query += ` ORDER BY t.created_at DESC`;

      const tickets = db.prepare(query).all(...params);
      res.json({ tickets });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/tickets - Submit a new support ticket
  router.post('/', (req, res, next) => {
    try {
      const { title, description, category, priority } = req.body;
      const errors = [];

      // Validation
      if (!title || typeof title !== 'string' || title.trim().length < 5 || title.trim().length > 100) {
        errors.push('Title must be between 5 and 100 characters long');
      }

      if (!description || typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 1000) {
        errors.push('Description must be between 10 and 1000 characters long');
      }

      if (!category || !VALID_CATEGORIES.includes(category)) {
        errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
      }

      if (!priority || !VALID_PRIORITIES.includes(priority)) {
        errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
      }

      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }

      const stmt = db.prepare(`
        INSERT INTO tickets (title, description, category, priority, status, created_by)
        VALUES (?, ?, ?, ?, 'Open', ?)
      `);

      const result = stmt.run(
        title.trim(),
        description.trim(),
        category,
        priority,
        req.user.id
      );

      const newTicket = db.prepare(`
        SELECT 
          t.*,
          u.name AS creator_name,
          u.email AS creator_email
        FROM tickets t
        JOIN users u ON t.created_by = u.id
        WHERE t.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json({
        message: 'Ticket created successfully',
        ticket: newTicket
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/tickets/:id - View ticket details
  router.get('/:id', (req, res, next) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID format' });
      }

      const ticket = db.prepare(`
        SELECT 
          t.*,
          u.name AS creator_name,
          u.email AS creator_email
        FROM tickets t
        JOIN users u ON t.created_by = u.id
        WHERE t.id = ?
      `).get(ticketId);

      if (!ticket) {
        return res.status(404).json({ error: `Ticket #${ticketId} not found` });
      }

      // Authorization check: Employee can only view their own ticket
      if (req.user.role === 'EMPLOYEE' && ticket.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view this ticket' });
      }

      res.json({ ticket });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/tickets/:id/status - Update ticket status (Support Staff only)
  router.patch('/:id/status', requireRole('SUPPORT'), (req, res, next) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID format' });
      }

      const { status } = req.body;
      if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`
        });
      }

      const existingTicket = db.prepare('SELECT id, status FROM tickets WHERE id = ?').get(ticketId);
      if (!existingTicket) {
        return res.status(404).json({ error: `Ticket #${ticketId} not found` });
      }

      db.prepare(`
        UPDATE tickets
        SET status = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(status, ticketId);

      const updatedTicket = db.prepare(`
        SELECT 
          t.*,
          u.name AS creator_name,
          u.email AS creator_email
        FROM tickets t
        JOIN users u ON t.created_by = u.id
        WHERE t.id = ?
      `).get(ticketId);

      res.json({
        message: 'Status updated successfully',
        ticket: updatedTicket
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = {
  createTicketsRouter,
  VALID_CATEGORIES,
  VALID_PRIORITIES,
  VALID_STATUSES
};
