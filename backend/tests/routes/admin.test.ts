import request from 'supertest';
import express from 'express';

jest.mock('../../src/middleware/verifyJwt', () => ({
  verifyJwt: () => (req: any, _res: any, next: any) => {
    req.authUser = { id: 'a1', role: 'Super Admin' };
    next();
  }
}));

import router from '../../src/routes/admin';
import AdminUser from '../../src/models/adminUser';

jest.mock('../../src/models/adminUser');

const app = express();
app.use(express.json());
app.use(router);

describe('admin routes - me profile', () => {
  it('updates authenticated admin user', async () => {
    (AdminUser.findByIdAndUpdate as jest.Mock).mockResolvedValue({ id: 'a1', name: 'New' });

    const res = await request(app).put('/me/profile').send({ name: 'New' });

    expect(res.status).toBe(200);
    expect(AdminUser.findByIdAndUpdate).toHaveBeenCalledWith('a1', { name: 'New' }, { new: true });
  });

  it('returns 404 when admin not found', async () => {
    (AdminUser.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/me/profile').send({ name: 'X' });

    expect(res.status).toBe(404);
  });
});
