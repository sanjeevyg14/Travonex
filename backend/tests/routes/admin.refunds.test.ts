import request from 'supertest';
import express from 'express';

jest.mock('../../src/middleware/verifyJwt', () => ({
  verifyJwt: () => (_req: any, _res: any, next: any) => {
    _req.authUser = { id: 'admin1', role: 'ADMIN' };
    next();
  }
}));

import router from '../../src/routes/admin';
import Booking from '../../src/models/booking';

jest.mock('../../src/models/booking');

const app = express();
app.use(express.json());
app.use(router);

describe('admin refunds routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists cancelled bookings', async () => {
    (Booking.find as jest.Mock).mockResolvedValue([{ id: 'b1' }]);

    const res = await request(app).get('/refunds');

    expect(res.status).toBe(200);
    expect(Booking.find).toHaveBeenCalledWith({ status: 'Cancelled' });
    expect(res.body).toEqual([{ id: 'b1' }]);
  });

  it('processes a refund', async () => {
    (Booking.findByIdAndUpdate as jest.Mock).mockResolvedValue({ id: 'b1', refundStatus: 'Processed' });

    const res = await request(app)
      .post('/refunds/b1/process')
      .send({ paymentMode: 'UPI', utrNumber: '123', paidDate: '2024-01-01' });

    expect(res.status).toBe(200);
    expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(
      'b1',
      expect.objectContaining({ refundStatus: 'Processed', refundPaymentMode: 'UPI', refundUtrNumber: '123' }),
      { new: true }
    );
  });
});
