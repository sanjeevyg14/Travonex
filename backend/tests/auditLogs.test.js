import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Trip from '../src/models/Trip.js';
import AdminUser from '../src/models/AdminUser.js';
import jwt from 'jsonwebtoken';
import assert from 'assert';

let mongoServer;
let token;

before(async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'travonex-test' });
  process.env.JWT_SECRET = 'testsecret';
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Audit log routes', () => {
  it('records a log on trip update and retrieves logs', async () => {
    const admin = await AdminUser.create({
      name: 'A',
      email: `admin-${Date.now()}@example.com`,
      password: 'pass'
    });
    token = jwt.sign({ id: admin._id.toString(), role: 'admin' }, process.env.JWT_SECRET);
    const trip = await Trip.create({ title: 'T', slug: 'audit-trip' });

    const res = await request(app)
      .patch(`/api/admin/trips/${trip._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 150 });
    assert.equal(res.statusCode, 200);

    const logsRes = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(logsRes.statusCode, 200);
    assert(Array.isArray(logsRes.body));
    assert(logsRes.body.length >= 1);
    assert.equal(logsRes.body[0].action, 'Trip updated');
  });

  it('exports logs as csv', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs/export')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.statusCode, 200);
    assert(res.headers['content-type'].includes('text/csv'));
  });
});
