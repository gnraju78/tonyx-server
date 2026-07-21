import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { startTestDatabase, stopTestDatabase, clearTestDatabase } from './testServer.js';

const app = createApp();

const validRegistration = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '+11234567890',
  password: 'secret123',
};

describe('Auth flow (integration)', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  it('registers, logs in, and fetches the profile with the issued token', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(validRegistration);

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.user.role).toBe('customer');
    expect(typeof registerRes.body.data.token).toBe('string');

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validRegistration.email, password: validRegistration.password });

    expect(loginRes.status).toBe(200);
    const token: string = loginRes.body.data.token;

    const profileRes = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.email).toBe(validRegistration.email);
  });

  it('ignores a client-supplied role and always registers as customer', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegistration, role: 'admin' });

    // Zod's `.strict()` schema rejects the unexpected `role` key outright.
    expect(res.status).toBe(422);
  });

  it('rejects profile access without a token', async () => {
    const res = await request(app).get('/api/v1/auth/profile');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects a duplicate email registration with 409', async () => {
    await request(app).post('/api/v1/auth/register').send(validRegistration);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegistration, phone: '+19999999999' });

    expect(res.status).toBe(409);
  });

  it('rejects login with an incorrect password', async () => {
    await request(app).post('/api/v1/auth/register').send(validRegistration);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validRegistration.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
  });
});
