import request from 'supertest';
import express from 'express';

import router from '../../src/routes/coupons';
import Coupon from '../../src/models/coupon';

jest.mock('../../src/models/coupon');

const app = express();
app.use(express.json());
app.use(router);

describe('coupons routes', () => {
  it('returns discount info for valid coupon', async () => {
    (Coupon.findOne as jest.Mock).mockResolvedValue({
      code: 'SAVE10',
      discountType: 'percent',
      discountValue: 10,
    });

    const res = await request(app).post('/validate').send({ code: 'SAVE10' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      code: 'SAVE10',
      discountType: 'percent',
      discountValue: 10,
    });
  });

  it('returns 400 for invalid coupon', async () => {
    (Coupon.findOne as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/validate').send({ code: 'BAD' });

    expect(res.status).toBe(400);
  });

  it('requires coupon code', async () => {
    const res = await request(app).post('/validate').send({});

    expect(res.status).toBe(400);
  });
});
