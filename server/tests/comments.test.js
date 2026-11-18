const request = require('supertest');
const { initializeDb } = require('../src/db');
const { seedDatabase } = require('../src/seed');
const { createApp } = require('../src/app');

describe('Comments API', () => {
  let db;
  let app;

  beforeEach(() => {
    db = initializeDb(':memory:');
    seedDatabase(db);
    app = createApp(db);
  });

  describe('GET /api/tickets/:ticketId/comments', () => {
    it('returns existing comments for a ticket', async () => {
      const res = await request(app)
        .get('/api/tickets/2/comments')
        .set('x-user-id', 'emp-1');

      expect(res.status).toBe(200);
      expect(res.body.comments).toBeInstanceOf(Array);
      expect(res.body.comments.length).toBe(2);
      expect(res.body.comments[0].author_name).toBeDefined();
    });

    it('denies employee access to comments on other users tickets', async () => {
      // Ticket 3 belongs to emp-2
      const res = await request(app)
        .get('/api/tickets/3/comments')
        .set('x-user-id', 'emp-1');

      expect(res.status).toBe(403);
    });

    it('allows support staff to view comments on any ticket', async () => {
      const res = await request(app)
        .get('/api/tickets/3/comments')
        .set('x-user-id', 'staff-1');

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/tickets/:ticketId/comments', () => {
    it('allows ticket creator to post a comment', async () => {
      const res = await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'emp-1')
        .send({ message: 'I also noticed the power light is blinking orange.' });

      expect(res.status).toBe(201);
      expect(res.body.comment).toBeDefined();
      expect(res.body.comment.ticket_id).toBe(1);
      expect(res.body.comment.user_id).toBe('emp-1');
      expect(res.body.comment.author_role).toBe('EMPLOYEE');
    });

    it('allows support staff to post a comment on any ticket', async () => {
      const res = await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'staff-1')
        .send({ message: 'We have dispatched a technician with a spare cable and test monitor.' });

      expect(res.status).toBe(201);
      expect(res.body.comment.author_role).toBe('SUPPORT');
    });

    it('validates empty comments', async () => {
      const res = await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'emp-1')
        .send({ message: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });
});
