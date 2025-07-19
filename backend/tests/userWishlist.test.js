import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Trip from '../src/models/Trip.js';
import jwt from 'jsonwebtoken';
import assert from 'assert';

describe('User wishlist API', () => {
  let mongoServer;
  let token;
  let trip1;
  let trip2;

  before(async () => {
    await mongoose.disconnect();
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'travonex-test' });
    process.env.JWT_SECRET = 'testsecret';
    trip1 = await Trip.create({ title: 'T1', slug: 't1' });
    trip2 = await Trip.create({ title: 'T2', slug: 't2' });
    const user = await User.create({ name: 'U', email: 'w@example.com', password: 'p', referralCode: 'r', wishlist: [trip1._id] });
    token = jwt.sign({ id: user._id.toString(), role: 'user' }, process.env.JWT_SECRET);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('returns wishlist for authenticated user', async () => {
    const res = await request(app)
      .get('/api/users/me/wishlist')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
  });

  it('adds a trip to wishlist', async () => {
    const res = await request(app)
      .post('/api/users/me/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ tripId: trip2._id.toString() });
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.length, 2);
  });

  it('removes a trip from wishlist', async () => {
    const res = await request(app)
      .delete(`/api/users/me/wishlist/${trip1._id.toString()}`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
  });
});
