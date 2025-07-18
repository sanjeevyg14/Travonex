import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
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
  const transactions = [
    { date: new Date(), description: 'Referral Bonus', amount: 100, type: 'Credit', source: 'Referral' },
    { date: new Date(), description: 'Booking Payment', amount: -50, type: 'Debit', source: 'Booking' }
  ];
  const user = await User.create({ name: 'U', email: 'wallet@example.com', password: 'p', referralCode: 'ref123', walletTransactions: transactions });
  token = jwt.sign({ id: user._id.toString(), role: 'user' }, process.env.JWT_SECRET);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Wallet transactions API', () => {
  it('returns wallet transactions for authenticated user', async () => {
    const res = await request(app)
      .get('/api/users/me/wallet-transactions')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 2);
    assert.equal(res.body[0].description, 'Referral Bonus');
  });
});
