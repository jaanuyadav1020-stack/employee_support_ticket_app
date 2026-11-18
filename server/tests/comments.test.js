const request = require('supertest');
const { initializeDb } = require('../src/db');
const { seedDatabase } = require('../src/seed');
const { createApp } = require('../src/app');

describe('Comments Feature API', () => {
  let db;
  let app;

  beforeEach(() => {
    db = initializeDb(':memory:');
    seedDatabase(db);
    app = createApp(db);
  });

  describe('GET /api/tickets/:ticketId/comments', () => {
    it('returns existing comments for a ticket in chronological order', async () => {
      const res = await request(app)
        .get('/api/tickets/2/comments')
        .set('x-user-id', 'emp-1');

      expect(res.status).toBe(200);
      expect(res.body.comments).toBeInstanceOf(Array);
      expect(res.body.comments.length).toBe(2);

      // Verify author details and timestamp
      const [firstComment, secondComment] = res.body.comments;
      expect(firstComment.author_name).toBe('Bob Smith');
      expect(firstComment.author_role).toBe('SUPPORT');
      expect(firstComment.created_at).toBeDefined();

      expect(secondComment.author_name).toBe('Alice Johnson');
      expect(secondComment.author_role).toBe('EMPLOYEE');
      expect(secondComment.created_at).toBeDefined();

      // Verify chronological ordering
      expect(new Date(firstComment.created_at).getTime()).toBeLessThanOrEqual(
        new Date(secondComment.created_at).getTime()
      );
    });

    it('returns 404 if the ticket does not exist', async () => {
      const res = await request(app)
        .get('/api/tickets/99999/comments')
        .set('x-user-id', 'staff-1');

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/ticket #99999 not found/i);
    });

    it('denies employee access to comments on another employee ticket', async () => {
      // Ticket 3 belongs to emp-2
      const res = await request(app)
        .get('/api/tickets/3/comments')
        .set('x-user-id', 'emp-1');

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden/i);
    });

    it('allows support staff to view comments on any ticket', async () => {
      const res = await request(app)
        .get('/api/tickets/3/comments')
        .set('x-user-id', 'staff-1');

      expect(res.status).toBe(200);
      expect(res.body.comments).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/tickets/:ticketId/comments', () => {
    it('allows the ticket creator to submit a comment', async () => {
      const message = 'I also noticed the power light is blinking orange.';
      const res = await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'emp-1')
        .send({ message });

      expect(res.status).toBe(201);
      expect(res.body.comment).toBeDefined();
      expect(res.body.comment.ticket_id).toBe(1);
      expect(res.body.comment.user_id).toBe('emp-1');
      expect(res.body.comment.author_role).toBe('EMPLOYEE');
      expect(res.body.comment.message).toBe(message);
      expect(res.body.comment.created_at).toBeDefined();
    });

    it('allows support staff to post a comment on any ticket', async () => {
      const message = 'Technician dispatched with spare parts.';
      const res = await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'staff-1')
        .send({ message });

      expect(res.status).toBe(201);
      expect(res.body.comment.author_role).toBe('SUPPORT');
      expect(res.body.comment.message).toBe(message);
    });

    it('returns 404 when submitting a comment on a non-existent ticket', async () => {
      const res = await request(app)
        .post('/api/tickets/99999/comments')
        .set('x-user-id', 'staff-1')
        .send({ message: 'This ticket does not exist.' });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/ticket #99999 not found/i);
    });

    it('forbids an employee from commenting on another employee ticket', async () => {
      // Ticket 3 belongs to emp-2
      const res = await request(app)
        .post('/api/tickets/3/comments')
        .set('x-user-id', 'emp-1')
        .send({ message: 'Unauthorized comment attempt.' });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden/i);
    });

    it('validates empty comments and whitespace-only submissions', async () => {
      // Empty string
      const res1 = await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'emp-1')
        .send({ message: '' });

      expect(res1.status).toBe(400);
      expect(res1.body.error).toBe('Validation failed');

      // Whitespace string
      const res2 = await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'emp-1')
        .send({ message: '     ' });

      expect(res2.status).toBe(400);
      expect(res2.body.error).toBe('Validation failed');
    });

    it('ensures comments belong strictly to the target ticket and do not leak into others', async () => {
      const uniqueCommentMsg = 'Unique diagnostic message for Ticket #1 ONLY';

      // Post on Ticket 1
      await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'emp-1')
        .send({ message: uniqueCommentMsg });

      // Fetch Ticket 1 comments
      const resTicket1 = await request(app)
        .get('/api/tickets/1/comments')
        .set('x-user-id', 'emp-1');

      expect(resTicket1.status).toBe(200);
      const matchIn1 = resTicket1.body.comments.some(c => c.message === uniqueCommentMsg);
      expect(matchIn1).toBe(true);

      // Fetch Ticket 2 comments
      const resTicket2 = await request(app)
        .get('/api/tickets/2/comments')
        .set('x-user-id', 'emp-1');

      expect(resTicket2.status).toBe(200);
      const matchIn2 = resTicket2.body.comments.some(c => c.message === uniqueCommentMsg);
      expect(matchIn2).toBe(false);
    });
  });
});
