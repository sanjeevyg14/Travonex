import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Content from '../src/models/Content.js';
import Faq from '../src/models/Faq.js';
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

describe('Content and FAQ routes', () => {
  it('creates and fetches page content', async () => {
    const slug = 'test-page';
    await request(app).put(`/api/content/${slug}`).send({ body: 'Hello' }).expect(200);
    const res = await request(app).get(`/api/content/${slug}`);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.slug, slug);
    assert.equal(res.body.body, 'Hello');
  });

  it('adds and updates an FAQ', async () => {
    const createRes = await request(app).post('/api/faqs').send({ question: 'Q?', answer: 'A' });
    assert.equal(createRes.statusCode, 201);
    const id = createRes.body._id;
    const updateRes = await request(app).put(`/api/faqs/${id}`).send({ question: 'Q2', answer: 'A2' });
    assert.equal(updateRes.statusCode, 200);
    assert.equal(updateRes.body.answer, 'A2');
    const listRes = await request(app).get('/api/faqs');
    assert.equal(listRes.statusCode, 200);
    assert.equal(listRes.body.length, 1);
    assert.equal(listRes.body[0]._id, id);
  });
});
