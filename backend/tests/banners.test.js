import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Banner from '../src/models/Banner.js';
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

describe('Banners API', () => {
  it('returns only active banners', async () => {
    await Banner.create([
      { title: 'Active Banner', imageUrl: 'http://img', isActive: true },
      { title: 'Inactive Banner', imageUrl: 'http://img2', isActive: false }
    ]);
    const res = await request(app).get('/api/banners');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].title, 'Active Banner');
  });
});
