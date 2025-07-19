import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import Role from '../src/models/Role.js';
import assert from 'assert';

let mongoServer;
let token;

before(async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'travonex-test' });
  process.env.JWT_SECRET = 'testsecret';
  token = jwt.sign({ id: 'admin1', role: 'admin' }, process.env.JWT_SECRET);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Admin roles and users routes', () => {
  it('creates and lists roles', async () => {
    const resCreate = await request(app)
      .post('/api/admin/access/roles')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Support', permissions: { Dashboard: ['View'] } });
    assert.equal(resCreate.statusCode, 201);

    const resList = await request(app)
      .get('/api/admin/access/roles')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(resList.statusCode, 200);
    assert.equal(resList.body.length, 1);
  });

  it('creates and updates an admin user', async () => {
    const role = await Role.findOne();
    const resCreate = await request(app)
      .post('/api/admin/access/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Admin',
        email: 'a@example.com',
        password: 'secret123',
        role: role._id,
        status: 'Active'
      });
    assert.equal(resCreate.statusCode, 201);
    const admin = resCreate.body;

    const resUpdate = await request(app)
      .put(`/api/admin/access/users/${admin._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Suspended' });
    assert.equal(resUpdate.statusCode, 200);
    assert.equal(resUpdate.body.status, 'Suspended');
  });
});
