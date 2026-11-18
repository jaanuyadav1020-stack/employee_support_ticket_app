const request = require('supertest');
const { initializeDb } = require('../src/db');
const { seedDatabase } = require('../src/seed');
const { createApp } = require('../src/app');

describe('Tickets API', () => {
  let db;
  let app;

  beforeEach(() => {
    db = initializeDb(':memory:');
    seedDatabase(db);
    app = createApp(db);
  });

  describe('GET /api/tickets', () => {
    it('returns 401 if x-user-id header is missing', async () => {
      const res = await request(app).get('/api/tickets');
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/missing x-user-id/i);
    });

    it('returns only tickets created by the authenticated employee', async () => {
      const res = await request(app)
        .get('/api/tickets')
        .set('x-user-id', 'emp-1');

      expect(res.status).toBe(200);
      expect(res.body.tickets).toBeDefined();
      expect(res.body.tickets.length).toBe(2);
      res.body.tickets.forEach(ticket => {
        expect(ticket.created_by).toBe('emp-1');
      });
    });

    it('returns all tickets across all users for support staff', async () => {
      const res = await request(app)
        .get('/api/tickets')
        .set('x-user-id', 'staff-1');

      expect(res.status).toBe(200);
      expect(res.body.tickets.length).toBe(4);
    });

    it('filters tickets by status correctly', async () => {
      const res = await request(app)
        .get('/api/tickets?status=Open')
        .set('x-user-id', 'staff-1');

      expect(res.status).toBe(200);
      res.body.tickets.forEach(t => expect(t.status).toBe('Open'));
    });

    it('allows support staff to query tickets belonging to a specific employee', async () => {
      const res = await request(app)
        .get('/api/tickets?employeeId=emp-1')
        .set('x-user-id', 'staff-1');

      expect(res.status).toBe(200);
      expect(res.body.tickets.length).toBe(2);
      res.body.tickets.forEach(t => expect(t.created_by).toBe('emp-1'));
    });
  });

  describe('POST /api/tickets', () => {
    it('creates a new ticket with valid inputs', async () => {
      const newTicketData = {
        title: 'New keyboard requested for desk 12',
        description: 'Spacebar is sticking on my current keyboard. Need standard replacement.',
        category: 'Hardware',
        priority: 'Low'
      };

      const res = await request(app)
        .post('/api/tickets')
        .set('x-user-id', 'emp-1')
        .send(newTicketData);

      expect(res.status).toBe(201);
      expect(res.body.ticket).toBeDefined();
      expect(res.body.ticket.title).toBe(newTicketData.title);
      expect(res.body.ticket.status).toBe('Open');
      expect(res.body.ticket.created_by).toBe('emp-1');
    });

    it('validates required fields and length constraints', async () => {
      const invalidData = {
        title: 'Hi', // too short (< 5)
        description: 'Short', // too short (< 10)
        category: 'NonExistentCategory',
        priority: 'SuperHigh'
      };

      const res = await request(app)
        .post('/api/tickets')
        .set('x-user-id', 'emp-1')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details.length).toBeGreaterThanOrEqual(4);
    });

    describe('Regression: Empty and Whitespace-Only Title Validation', () => {
      it('rejects an empty title with an appropriate error message', async () => {
        const res = await request(app)
          .post('/api/tickets')
          .set('x-user-id', 'emp-1')
          .send({
            title: '',
            description: 'Valid description that meets all length requirements',
            category: 'Hardware',
            priority: 'Low'
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation failed');
        expect(res.body.details).toContain('Title is required and cannot be empty or whitespace only');
      });

      it('rejects a whitespace-only title with an appropriate error message', async () => {
        const res = await request(app)
          .post('/api/tickets')
          .set('x-user-id', 'emp-1')
          .send({
            title: '      ',
            description: 'Valid description that meets all length requirements',
            category: 'Hardware',
            priority: 'Low'
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation failed');
        expect(res.body.details).toContain('Title is required and cannot be empty or whitespace only');
      });

      it('accepts a valid title and creates the ticket', async () => {
        const res = await request(app)
          .post('/api/tickets')
          .set('x-user-id', 'emp-1')
          .send({
            title: 'Valid workplace ticket title',
            description: 'Valid description that meets all length requirements',
            category: 'Hardware',
            priority: 'Low'
          });

        expect(res.status).toBe(201);
        expect(res.body.ticket).toBeDefined();
        expect(res.body.ticket.title).toBe('Valid workplace ticket title');
        expect(res.body.ticket.status).toBe('Open');
      });
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('allows an employee to view their own ticket', async () => {
      const res = await request(app)
        .get('/api/tickets/1')
        .set('x-user-id', 'emp-1');

      expect(res.status).toBe(200);
      expect(res.body.ticket.id).toBe(1);
    });

    it('forbids an employee from viewing another employee ticket', async () => {
      // Ticket 3 belongs to emp-2
      const res = await request(app)
        .get('/api/tickets/3')
        .set('x-user-id', 'emp-1');

      expect(res.status).toBe(403);
    });

    it('allows support staff to view any employee ticket', async () => {
      const res = await request(app)
        .get('/api/tickets/3')
        .set('x-user-id', 'staff-1');

      expect(res.status).toBe(200);
      expect(res.body.ticket.id).toBe(3);
    });
  });

  describe('PATCH /api/tickets/:id/status', () => {
    it('forbids employees from updating status', async () => {
      const res = await request(app)
        .patch('/api/tickets/1/status')
        .set('x-user-id', 'emp-1')
        .send({ status: 'Resolved' });

      expect(res.status).toBe(403);
    });

    it('allows support staff to update ticket status', async () => {
      const res = await request(app)
        .patch('/api/tickets/1/status')
        .set('x-user-id', 'staff-1')
        .send({ status: 'In Progress' });

      expect(res.status).toBe(200);
      expect(res.body.ticket.status).toBe('In Progress');
    });

    it('rejects invalid status transitions', async () => {
      const res = await request(app)
        .patch('/api/tickets/1/status')
        .set('x-user-id', 'staff-1')
        .send({ status: 'NotAStatus' });

      expect(res.status).toBe(400);
    });
  });
});
