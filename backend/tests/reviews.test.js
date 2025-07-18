import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import assert from 'assert';

let mongoServer;

before(async () => {
  // Ensure no active connections before starting a new in-memory server
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'travonex-test' });
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Reviews API', () => {
  it('returns empty list initially', async () => {
    const res = await request(app).get('/api/reviews');
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, []);
  });
});
