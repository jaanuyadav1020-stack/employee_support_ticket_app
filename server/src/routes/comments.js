const express = require('express');
const { createCommentsController } = require('../controllers/commentsController');

function createCommentsRouter(db) {
  const router = express.Router({ mergeParams: true });
  const controller = createCommentsController(db);

  // 1. GET /api/tickets/:ticketId/comments - Get comments for a ticket
  router.get('/', controller.getComments);

  // 2. POST /api/tickets/:ticketId/comments - Add a comment to a ticket
  router.post('/', controller.addComment);

  return router;
}

module.exports = { createCommentsRouter };
