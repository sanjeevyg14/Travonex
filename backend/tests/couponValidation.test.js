import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Coupon from '../src/models/Coupon.js';
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

describe('Coupon validation', () => {
  it('validates a coupon code', async () => {
    const coupon = await Coupon.create({ code: 'SAVE10', discount: 10, expiresAt: new Date(Date.now() + 100000) });
    const res = await request(app).post('/api/coupons/validate').send({ code: 'SAVE10' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.discount, coupon.discount);
  });
});
