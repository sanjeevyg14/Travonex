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

describe('Booking cancellation', () => {
  it('cancels a booking', async () => {
    const user = await User.create({ name: 'U', email: 'u@example.com', password: 'p' });
    const trip = await Trip.create({ title: 'T', slug: 't' });
    const booking = await Booking.create({ user: user._id, trip: trip._id });

    const res = await request(app).post(`/api/bookings/${booking._id}/cancel`);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'cancelled');
  });
});
