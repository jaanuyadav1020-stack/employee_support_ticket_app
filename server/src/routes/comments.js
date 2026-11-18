const express = require('express');

function createCommentsRouter(db) {
  const router = express.Router({ mergeParams: true });

  // Helper to verify ticket access
  function checkTicketAccess(ticketId, user) {
    const ticket = db.prepare('SELECT id, created_by FROM tickets WHERE id = ?').get(ticketId);
    if (!ticket) {
      return { error: 'not_found', status: 404, message: `Ticket #${ticketId} not found` };
    }
    if (user.role === 'EMPLOYEE' && ticket.created_by !== user.id) {
      return { error: 'forbidden', status: 403, message: 'Forbidden: You do not have permission to view or comment on this ticket' };
    }
    return { ticket };
  }

  // GET /api/tickets/:ticketId/comments - List comments for a ticket
  router.get('/', (req, res, next) => {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID format' });
      }

      const access = checkTicketAccess(ticketId, req.user);
      if (access.error) {
        return res.status(access.status).json({ error: access.message });
      }

      const comments = db.prepare(`
        SELECT 
          c.id,
          c.ticket_id,
          c.user_id,
          c.message,
          c.created_at,
          u.name AS author_name,
          u.email AS author_email,
          u.role AS author_role
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.ticket_id = ?
        ORDER BY c.created_at ASC
      `).all(ticketId);

      res.json({ comments });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/tickets/:ticketId/comments - Add comment to ticket
  router.post('/', (req, res, next) => {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID format' });
      }

      const access = checkTicketAccess(ticketId, req.user);
      if (access.error) {
        return res.status(access.status).json({ error: access.message });
      }

      const { message } = req.body;
      if (!message || typeof message !== 'string' || message.trim().length === 0 || message.trim().length > 500) {
        return res.status(400).json({
          error: 'Validation failed',
          details: ['Comment message must be between 1 and 500 characters long']
        });
      }

      const result = db.prepare(`
        INSERT INTO comments (ticket_id, user_id, message)
        VALUES (?, ?, ?)
      `).run(ticketId, req.user.id, message.trim());

      const newComment = db.prepare(`
        SELECT 
          c.id,
          c.ticket_id,
          c.user_id,
          c.message,
          c.created_at,
          u.name AS author_name,
          u.email AS author_email,
          u.role AS author_role
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json({
        message: 'Comment added successfully',
        comment: newComment
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createCommentsRouter };
