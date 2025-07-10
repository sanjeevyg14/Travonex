import request from 'supertest';
import express from 'express';

jest.mock('../../src/middleware/verifyJwt', () => ({
  verifyJwt: () => (req: any, _res: any, next: any) => {
    req.authUser = { id: 'authUser', role: 'USER' };
    next();
  }
}));

jest.mock('../../src/index', () => ({
  razorpay: { orders: { create: jest.fn().mockResolvedValue({ id: 'order' }) } }
}));

import router from '../../src/routes/bookings';
import Booking from '../../src/models/booking';
import Trip from '../../src/models/trip';
import PromoCode from '../../src/models/promoCode';
import User from '../../src/models/user';

jest.mock('../../src/models/booking');
jest.mock('../../src/models/trip');
jest.mock('../../src/models/promoCode');
jest.mock('../../src/models/user');

const app = express();
app.use(express.json());
app.use(router);

describe('bookings routes', () => {
  it('uses authUser id when creating booking', async () => {
    (Trip.findById as jest.Mock).mockResolvedValue({
      batches: [{ id: 'batch', priceOverride: 100, availableSlots: 5 }],
      price: 100
    });
    (Booking.create as jest.Mock).mockResolvedValue({ id: 'b1' });

    await request(app)
      .post('/create')
      .send({ tripId: 't1', batchId: 'batch', travelers: [], userId: 'body' });

    expect(Booking.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'authUser' })
    );
  });

  it('applies coupon and wallet on booking', async () => {
    (Trip.findById as jest.Mock).mockResolvedValue({
      batches: [{ id: 'batch', priceOverride: 100, availableSlots: 5 }],
      price: 100
    });
    (PromoCode.findOne as jest.Mock).mockResolvedValue({
      type: 'Percentage',
      value: 20,
      usage: 0,
      limit: 10,
      expiryDate: new Date(Date.now() + 1000),
      save: jest.fn().mockResolvedValue(null)
    });
    const user: any = { walletBalance: 30, save: jest.fn().mockResolvedValue(null) };
    (User.findById as jest.Mock).mockResolvedValue(user);
    (Booking.create as jest.Mock).mockResolvedValue({ id: 'b1' });

    await request(app)
      .post('/create')
      .send({ tripId: 't1', batchId: 'batch', travelers: [{}], couponCode: 'CODE', walletAmount: 10 });

    expect(Booking.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 70, couponDiscount: 20, walletAmountUsed: 10 })
    );
    expect(user.walletBalance).toBe(20);
    expect(user.save).toHaveBeenCalled();
  });

  it('rejects promo when usage limit reached', async () => {
    (Trip.findById as jest.Mock).mockResolvedValue({
      batches: [{ id: 'batch', priceOverride: 100, availableSlots: 5 }],
      price: 100
    });
    (PromoCode.findOne as jest.Mock).mockResolvedValue({
      type: 'Fixed',
      value: 10,
      usage: 5,
      limit: 5,
      expiryDate: new Date(Date.now() + 1000),
      save: jest.fn()
    });

    const res = await request(app)
      .post('/create')
      .send({ tripId: 't1', batchId: 'batch', travelers: [{}], couponCode: 'CODE' });

    expect(res.status).toBe(400);
  });

  describe('payment callback', () => {
    beforeEach(() => {
      process.env.RAZORPAY_KEY_SECRET = 'secret';
    });

    it('confirms booking on valid signature', async () => {
      const save = jest.fn().mockResolvedValue(null);
      (Booking.findOne as jest.Mock).mockResolvedValue({
        tripId: 't1',
        batchId: 'b1',
        travelers: [{}],
        save
      });
      (Trip.findById as jest.Mock).mockResolvedValue({
        batches: [{ id: 'b1', availableSlots: 5 }],
        save: jest.fn().mockResolvedValue(null)
      });
      const signature = require('crypto')
        .createHmac('sha256', 'secret')
        .update('order|pay')
        .digest('hex');

      const res = await request(app).post('/payment-callback').send({
        razorpay_order_id: 'order',
        razorpay_payment_id: 'pay',
        razorpay_signature: signature
      });

      expect(res.status).toBe(200);
      expect(save).toHaveBeenCalled();
    });

    it('rejects invalid signature', async () => {
      const res = await request(app).post('/payment-callback').send({
        razorpay_order_id: 'o',
        razorpay_payment_id: 'p',
        razorpay_signature: 'bad'
      });
      expect(res.status).toBe(400);
    });
  });
});
