import request from 'supertest';
import express from 'express';

import router from '../../src/routes/reference';
import City from '../../src/models/city';
import Category from '../../src/models/category';
import Interest from '../../src/models/interest';

jest.mock('../../src/models/city');
jest.mock('../../src/models/category');
jest.mock('../../src/models/interest');

const app = express();
app.use(express.json());
app.use(router);

describe('reference routes', () => {
  it('lists cities', async () => {
    (City.find as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/cities');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('lists categories', async () => {
    (Category.find as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('lists interests', async () => {
    (Interest.find as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/interests');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
