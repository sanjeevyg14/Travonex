import request from 'supertest';
import express from 'express';

jest.mock('../../src/middleware/verifyJwt', () => ({
  verifyJwt: () => (_req: any, _res: any, next: any) => {
    (_req as any).authUser = { id: 'admin', role: 'Super Admin' };
    next();
  }
}));

import router from '../../src/routes/admin';
import Category from '../../src/models/category';
import Interest from '../../src/models/interest';
import City from '../../src/models/city';

jest.mock('../../src/models/category');
jest.mock('../../src/models/interest');
jest.mock('../../src/models/city');

const app = express();
app.use(express.json());
app.use(router);

describe('admin categories/interests/cities routes', () => {
  it('lists categories', async () => {
    (Category.find as jest.Mock).mockResolvedValue([{ name: 'Adventure' }]);
    const res = await request(app).get('/categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ name: 'Adventure' }]);
  });

  it('creates a category', async () => {
    (Category.create as jest.Mock).mockResolvedValue({ id: 'c1' });
    const res = await request(app).post('/categories').send({ name: 'New' });
    expect(res.status).toBe(201);
    expect(Category.create).toHaveBeenCalledWith({ name: 'New' });
  });

  it('lists interests', async () => {
    (Interest.find as jest.Mock).mockResolvedValue([{ name: 'Hiking' }]);
    const res = await request(app).get('/interests');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ name: 'Hiking' }]);
  });

  it('creates a city', async () => {
    (City.create as jest.Mock).mockResolvedValue({ id: 'city1' });
    const res = await request(app).post('/cities').send({ name: 'Goa' });
    expect(res.status).toBe(201);
    expect(City.create).toHaveBeenCalledWith({ name: 'Goa' });
  });
});
