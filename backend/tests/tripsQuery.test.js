import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Trip from '../src/models/Trip.js';
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

describe('Trips query parameters', () => {
  beforeEach(async () => {
    await Trip.deleteMany({});
  });

  it('filters banner trips when isBanner=true', async () => {
    await Trip.create([
      { title: 'B1', slug: 'b1', isBannerTrip: true },
      { title: 'N1', slug: 'n1', isBannerTrip: false },
      { title: 'B2', slug: 'b2', isBannerTrip: true }
    ]);

    const res = await request(app).get('/api/trips?isBanner=true');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 2);
    assert(res.body.every(t => t.isBannerTrip === true));
  });

  it('applies numeric limit', async () => {
    await Trip.create([
      { title: 'T1', slug: 't1' },
      { title: 'T2', slug: 't2' },
      { title: 'T3', slug: 't3' }
    ]);

    const res = await request(app).get('/api/trips?limit=2');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 2);
  });
});
