import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import assert from 'assert';

let mongoServer;

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

describe('Auth login', () => {
  it('logs in a user with email and password', async () => {
    await User.create({ name: 'U1', email: 'u1@example.com', password: 'pass', referralCode: 'r1' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'u1@example.com', password: 'pass' });
    assert.equal(res.statusCode, 200);
    assert(res.body.user);
    assert(res.body.token);
    assert(res.body.redirectPath);
  });

  it('returns 401 for invalid password', async () => {
    await User.create({ name: 'U2', email: 'u2@example.com', password: 'pass', referralCode: 'r2' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'u2@example.com', password: 'wrong' });
    assert.equal(res.statusCode, 401);
  });
});
