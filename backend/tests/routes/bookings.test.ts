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

jest.mock('../../src/models/booking');
jest.mock('../../src/models/trip');

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
});
