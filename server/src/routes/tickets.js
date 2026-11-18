const express = require('express');
const { requireRole } = require('../middleware/auth');
const { 
  createTicketsController, 
  VALID_CATEGORIES, 
  VALID_PRIORITIES, 
  VALID_STATUSES 
} = require('../controllers/ticketsController');

function createTicketsRouter(db) {
  const router = express.Router();
  const controller = createTicketsController(db);

  // 1. GET /api/tickets - Get all tickets (Support Staff) or tickets belonging to an employee
  router.get('/', controller.getTickets);

  // 2. POST /api/tickets - Create a new ticket
  router.post('/', controller.createTicket);

  // 3. GET /api/tickets/:id - Get ticket by ID
  router.get('/:id', controller.getTicketById);

  // 4. PATCH /api/tickets/:id/status - Update ticket status (Support Staff only)
  router.patch('/:id/status', requireRole('SUPPORT'), controller.updateTicketStatus);

  return router;
}

module.exports = {
  createTicketsRouter,
  VALID_CATEGORIES,
  VALID_PRIORITIES,
  VALID_STATUSES
};
