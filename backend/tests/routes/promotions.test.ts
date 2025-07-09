import request from 'supertest';
import express from 'express';

jest.mock('../../src/middleware/verifyJwt', () => ({
  verifyJwt: () => (_req: any, _res: any, next: any) => {
    (_req as any).authUser = { id: 'admin', role: 'Super Admin' };
    next();
  }
}));

import router from '../../src/routes/promotions';
import PromoCode from '../../src/models/promoCode';

jest.mock('../../src/models/promoCode');

const app = express();
app.use(express.json());
app.use(router);

describe('promotions routes', () => {
  it('lists promo codes', async () => {
    (PromoCode.find as jest.Mock).mockResolvedValue([{ id: 'p1' }]);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  it('creates promo code', async () => {
    (PromoCode.create as jest.Mock).mockResolvedValue({ id: 'p1' });
    const res = await request(app).post('/').send({ code: 'NEW' });
    expect(res.status).toBe(201);
  });

  it('disables promo code', async () => {
    (PromoCode.findByIdAndUpdate as jest.Mock).mockResolvedValue({ id: 'p1', status: 'Inactive' });
    const res = await request(app).patch('/p1/disable');
    expect(res.status).toBe(200);
  });
});
