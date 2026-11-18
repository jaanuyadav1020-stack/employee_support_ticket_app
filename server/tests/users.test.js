const request = require('supertest');
const { initializeDb } = require('../src/db');
const { seedDatabase } = require('../src/seed');
const { createApp } = require('../src/app');

describe('Users & System API', () => {
  let db;
  let app;

  beforeEach(() => {
    db = initializeDb(':memory:');
    seedDatabase(db);
    app = createApp(db);
  });

  describe('GET /api/health', () => {
    it('returns healthy service status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/users', () => {
    it('returns all pre-seeded user personas', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body.users.length).toBe(3);

      const roles = res.body.users.map(u => u.role);
      expect(roles).toContain('EMPLOYEE');
      expect(roles).toContain('SUPPORT');
    });
  });

  describe('GET /api/users/me', () => {
    it('returns current profile for authenticated employee', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('x-user-id', 'emp-1');

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe('emp-1');
      expect(res.body.user.name).toBe('Alice Johnson');
      expect(res.body.user.role).toBe('EMPLOYEE');
    });

    it('returns 401 if x-user-id is missing', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/missing x-user-id/i);
    });

    it('returns 401 if x-user-id is unrecognized', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('x-user-id', 'ghost-user');

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/not found/i);
    });
  });
});
