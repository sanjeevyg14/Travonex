import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Organizer from '../src/models/Organizer.js';
import User from '../src/models/User.js';
import Trip from '../src/models/Trip.js';
import Review from '../src/models/Review.js';
import Booking from '../src/models/Booking.js';
import Notification from '../src/models/Notification.js';
import jwt from 'jsonwebtoken';
import assert from 'assert';

let mongoServer;
let token;

before(async () => {
  // Close any leftover connection before starting the test database
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'travonex-test' });
  process.env.JWT_SECRET = 'testsecret';

  const organizer = await Organizer.create({ name: 'Org', email: 'org@example.com', password: 'pass' });
  const user = await User.create({ name: 'User', email: 'user@example.com', password: 'pass' });
  const trip = await Trip.create({ title: 'Trip1', slug: 'trip1', organizer: organizer._id, price: 100 });
  await Booking.create({
    user: user._id,
    trip: trip._id,
    status: 'confirmed',
    travelers: [
      { name: 'User', email: 'user@example.com', phone: '123', emergencyName: 'Em', emergencyPhone: '456' }
    ]
  });
  await Review.create({ user: user._id, trip: trip._id, rating: 5, comment: 'Great' });
  await Notification.create({ organizer: organizer._id, title: 'Test', message: 'Hello' });


  token = jwt.sign({ id: organizer._id.toString(), role: 'organizer' }, process.env.JWT_SECRET);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Organizer routes', () => {
  it('returns organizer reviews', async () => {
  const res = await request(app)
    .get('/api/organizers/me/reviews')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.statusCode, 200);
  assert(Array.isArray(res.body));
  });

  it('returns organizer notifications', async () => {
  const res = await request(app)
    .get('/api/organizers/me/notifications')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.statusCode, 200);
  assert(Array.isArray(res.body));
  });

  it('returns eligible payouts', async () => {
  const res = await request(app)
    .get('/api/organizers/me/eligible-payouts')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.statusCode, 200);
  assert(Array.isArray(res.body));
  });
});
