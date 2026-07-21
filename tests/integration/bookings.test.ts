import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { startTestDatabase, stopTestDatabase, clearTestDatabase } from './testServer.js';
import { User } from '../../src/models/User.js';
import { Service } from '../../src/models/Service.js';

const app = createApp();

async function registerAndLogin(email: string, phone: string): Promise<string> {
  await request(app).post('/api/v1/auth/register').send({
    firstName: 'Test',
    lastName: 'Customer',
    email,
    phone,
    password: 'secret123',
  });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'secret123' });
  return loginRes.body.data.token as string;
}

async function seedBarber(): Promise<string> {
  const barber = await User.create({
    firstName: 'Bob',
    lastName: 'Barber',
    email: 'bob@example.com',
    phone: '+12222222222',
    password: 'secret123',
    role: 'barber',
    isActive: true,
  });
  return barber._id.toString();
}

async function seedService(): Promise<string> {
  const service = await Service.create({
    name: 'Classic Haircut',
    description: 'A classic, timeless haircut for any occasion.',
    category: 'haircut',
    basePrice: 25,
    duration: 30,
  });
  return service._id.toString();
}

describe('Bookings flow (integration)', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  it('creates a booking end-to-end and prevents a second, second booking generating a duplicate bookingNumber', async () => {
    const token = await registerAndLogin('customer1@example.com', '+13333333333');
    const barberId = await seedBarber();
    const serviceId = await seedService();

    const first = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        barberId,
        serviceIds: [serviceId],
        scheduledDate: '2026-08-01',
        startTime: '10:00',
        endTime: '10:30',
      });

    expect(first.status).toBe(201);
    expect(first.body.data.totalPrice).toBe(25);
    expect(first.body.data.bookingNumber).toMatch(/^BK-\d{8}-[0-9A-F]{8}$/);

    const secondToken = await registerAndLogin('customer2@example.com', '+14444444444');
    const second = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({
        barberId,
        serviceIds: [serviceId],
        scheduledDate: '2026-08-02',
        startTime: '11:00',
        endTime: '11:30',
      });

    // A second booking must succeed (and get its own unique bookingNumber) —
    // this is the bug fix for the original schema, where `bookingNumber`
    // was `unique: true` but never set, so the 2nd booking ever created
    // would fail with a Mongo duplicate-key error.
    expect(second.status).toBe(201);
    expect(second.body.data.bookingNumber).not.toBe(first.body.data.bookingNumber);
  });

  it('rejects a conflicting booking for the same barber/time with 409', async () => {
    const token = await registerAndLogin('customer1@example.com', '+13333333333');
    const barberId = await seedBarber();
    const serviceId = await seedService();

    const payload = {
      barberId,
      serviceIds: [serviceId],
      scheduledDate: '2026-08-01',
      startTime: '10:00',
      endTime: '10:30',
    };

    await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    const conflict = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(conflict.status).toBe(409);
  });

  it('requires authentication to create a booking', async () => {
    const barberId = await seedBarber();
    const serviceId = await seedService();

    const res = await request(app)
      .post('/api/v1/bookings')
      .send({
        barberId,
        serviceIds: [serviceId],
        scheduledDate: '2026-08-01',
        startTime: '10:00',
        endTime: '10:30',
      });

    expect(res.status).toBe(401);
  });

  it('returns 404 for a non-existent booking id', async () => {
    const token = await registerAndLogin('customer1@example.com', '+13333333333');

    const res = await request(app)
      .get('/api/v1/bookings/64b7f5e2f1a2b3c4d5e6f7a8')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
