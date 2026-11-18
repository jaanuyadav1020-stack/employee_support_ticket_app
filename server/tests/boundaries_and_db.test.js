const request = require('supertest');
const { initializeDb } = require('../src/db');
const { seedDatabase } = require('../src/seed');
const { createApp } = require('../src/app');

describe('Boundary and Database Integrity Tests', () => {
  let db;
  let app;

  beforeEach(() => {
    db = initializeDb(':memory:');
    seedDatabase(db);
    app = createApp(db);
  });

  describe('Boundary Tests: Ticket Title (5 to 100 chars)', () => {
    it('accepts title with exactly 5 characters (lower bound)', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('x-user-id', 'emp-1')
        .send({
          title: '12345',
          description: 'Valid problem description that exceeds ten chars',
          category: 'Hardware',
          priority: 'Low'
        });

      expect(res.status).toBe(201);
      expect(res.body.ticket.title).toBe('12345');
    });

    it('rejects title with 4 characters (below lower bound)', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('x-user-id', 'emp-1')
        .send({
          title: '1234',
          description: 'Valid problem description that exceeds ten chars',
          category: 'Hardware',
          priority: 'Low'
        });

      expect(res.status).toBe(400);
      expect(res.body.details).toContain('Title must be between 5 and 100 characters long');
    });

    it('accepts title with exactly 100 characters (upper bound)', async () => {
      const title100 = 'T'.repeat(100);
      const res = await request(app)
        .post('/api/tickets')
        .set('x-user-id', 'emp-1')
        .send({
          title: title100,
          description: 'Valid problem description that exceeds ten chars',
          category: 'Hardware',
          priority: 'Low'
        });

      expect(res.status).toBe(201);
      expect(res.body.ticket.title.length).toBe(100);
    });

    it('rejects title with 101 characters (above upper bound)', async () => {
      const title101 = 'T'.repeat(101);
      const res = await request(app)
        .post('/api/tickets')
        .set('x-user-id', 'emp-1')
        .send({
          title: title101,
          description: 'Valid problem description that exceeds ten chars',
          category: 'Hardware',
          priority: 'Low'
        });

      expect(res.status).toBe(400);
      expect(res.body.details).toContain('Title must be between 5 and 100 characters long');
    });
  });

  describe('Boundary Tests: Ticket Description (10 to 1000 chars)', () => {
    it('accepts description with exactly 10 characters (lower bound)', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('x-user-id', 'emp-1')
        .send({
          title: 'Valid Title Here',
          description: '1234567890',
          category: 'Hardware',
          priority: 'Low'
        });

      expect(res.status).toBe(201);
      expect(res.body.ticket.description).toBe('1234567890');
    });

    it('rejects description with 9 characters (below lower bound)', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('x-user-id', 'emp-1')
        .send({
          title: 'Valid Title Here',
          description: '123456789',
          category: 'Hardware',
          priority: 'Low'
        });

      expect(res.status).toBe(400);
      expect(res.body.details).toContain('Description must be between 10 and 1000 characters long');
    });

    it('accepts description with exactly 1000 characters (upper bound)', async () => {
      const desc1000 = 'D'.repeat(1000);
      const res = await request(app)
        .post('/api/tickets')
        .set('x-user-id', 'emp-1')
        .send({
          title: 'Valid Title Here',
          description: desc1000,
          category: 'Hardware',
          priority: 'Low'
        });

      expect(res.status).toBe(201);
      expect(res.body.ticket.description.length).toBe(1000);
    });

    it('rejects description with 1001 characters (above upper bound)', async () => {
      const desc1001 = 'D'.repeat(1001);
      const res = await request(app)
        .post('/api/tickets')
        .set('x-user-id', 'emp-1')
        .send({
          title: 'Valid Title Here',
          description: desc1001,
          category: 'Hardware',
          priority: 'Low'
        });

      expect(res.status).toBe(400);
      expect(res.body.details).toContain('Description must be between 10 and 1000 characters long');
    });
  });

  describe('Boundary Tests: Comment Message (1 to 500 chars)', () => {
    it('accepts comment with exactly 1 character (lower bound)', async () => {
      const res = await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'emp-1')
        .send({ message: 'K' });

      expect(res.status).toBe(201);
      expect(res.body.comment.message).toBe('K');
    });

    it('accepts comment with exactly 500 characters (upper bound)', async () => {
      const msg500 = 'M'.repeat(500);
      const res = await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'emp-1')
        .send({ message: msg500 });

      expect(res.status).toBe(201);
      expect(res.body.comment.message.length).toBe(500);
    });

    it('rejects comment with 501 characters (above upper bound)', async () => {
      const msg501 = 'M'.repeat(501);
      const res = await request(app)
        .post('/api/tickets/1/comments')
        .set('x-user-id', 'emp-1')
        .send({ message: msg501 });

      expect(res.status).toBe(400);
      expect(res.body.details).toContain('Comment message must be between 1 and 500 characters long');
    });
  });

  describe('Database Integrity and Constraint Enforcement', () => {
    it('enforces foreign key constraint when inserting ticket with non-existent user', () => {
      expect(() => {
        db.prepare(`
          INSERT INTO tickets (title, description, category, priority, status, created_by)
          VALUES ('Ghost Ticket', 'Description with enough length', 'Hardware', 'Low', 'Open', 'non-existent-user')
        `).run();
      }).toThrow(/FOREIGN KEY constraint failed/i);
    });

    it('enforces foreign key constraint when inserting comment with non-existent ticket', () => {
      expect(() => {
        db.prepare(`
          INSERT INTO comments (ticket_id, user_id, message)
          VALUES (999999, 'emp-1', 'Orphaned comment')
        `).run();
      }).toThrow(/FOREIGN KEY constraint failed/i);
    });

    it('cascades deletion: deleting a ticket automatically deletes all its comments', () => {
      // Verify initial comments on ticket 2 exist
      const beforeComments = db.prepare('SELECT COUNT(*) as count FROM comments WHERE ticket_id = 2').get();
      expect(beforeComments.count).toBe(2);

      // Delete ticket 2
      db.prepare('DELETE FROM tickets WHERE id = 2').run();

      // Comments must now be 0
      const afterComments = db.prepare('SELECT COUNT(*) as count FROM comments WHERE ticket_id = 2').get();
      expect(afterComments.count).toBe(0);
    });

    it('enforces check constraints on ticket status at database level', () => {
      expect(() => {
        db.prepare(`
          INSERT INTO tickets (title, description, category, priority, status, created_by)
          VALUES ('Valid Title', 'Valid Description', 'Hardware', 'Low', 'INVALID_STATUS', 'emp-1')
        `).run();
      }).toThrow(/CHECK constraint failed/i);
    });
  });
});
