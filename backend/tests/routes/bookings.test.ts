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
import Coupon from '../../src/models/coupon';
import User from '../../src/models/user';

jest.mock('../../src/models/booking');
jest.mock('../../src/models/trip');
jest.mock('../../src/models/coupon');
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
    (Coupon.findOne as jest.Mock).mockResolvedValue({ discountType: 'amount', discountValue: 20 });
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
});
