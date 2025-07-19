import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Booking from '../src/models/Booking.js';
import Trip from '../src/models/Trip.js';
import User from '../src/models/User.js';
import assert from 'assert';

let mongoServer;

before(async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'travonex-test' });
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Booking creation via /create', () => {
  it('creates a booking', async () => {
    const user = await User.create({ name: 'U', email: `u${Date.now()}@example.com`, password: 'p', referralCode: `ref${Date.now()}` });
    const trip = await Trip.create({ title: 'T', slug: `t${Date.now()}` });
    const res = await request(app)
      .post('/api/bookings/create')
      .send({ user: user._id.toString(), trip: trip._id.toString() });
    assert.equal(res.statusCode, 201);
    assert(res.body._id);

    // ensure booking stored
    const found = await Booking.findById(res.body._id);
    assert(found);
  });
});
