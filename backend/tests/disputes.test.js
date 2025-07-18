import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Dispute from '../src/models/Dispute.js';
import User from '../src/models/User.js';
import Booking from '../src/models/Booking.js';
import Trip from '../src/models/Trip.js';
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
  const user = await User.create({ name: 'U', email: 'u@example.com', password: 'p' });
  const trip = await Trip.create({ title: 'T', slug: 't' });
  const booking = await Booking.create({ user: user._id, trip: trip._id });
  token = jwt.sign({ id: user._id.toString(), role: 'user' }, process.env.JWT_SECRET);
  // attach booking id to global for test
  global.testBookingId = booking._id;
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Dispute routes', () => {
  it('creates a dispute', async () => {
    const res = await request(app)
      .post('/api/disputes')
      .set('Authorization', `Bearer ${token}`)
      .send({ booking: global.testBookingId, description: 'Issue' });
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.status, 'open');
  });
});
