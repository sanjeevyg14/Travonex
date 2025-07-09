import request from 'supertest';
import express from 'express';

jest.mock('../../src/middleware/verifyJwt', () => ({
  verifyJwt: () => (req: any, _res: any, next: any) => {
    req.authUser = { id: 'admin1', role: 'ADMIN' };
    req.authUser = { id: 'a1', role: 'Super Admin' };
    next();
  }
}));

import router from '../../src/routes/admin';
import User from '../../src/models/user';
import Organizer from '../../src/models/organizer';
import AuditLog from '../../src/models/auditLog';

jest.mock('../../src/models/user');
jest.mock('../../src/models/organizer');
jest.mock('../../src/models/auditLog');
import AdminUser from '../../src/models/adminUser';

jest.mock('../../src/models/adminUser');

const app = express();
app.use(express.json());
app.use(router);

describe('admin audit logging', () => {
  it('logs user update', async () => {
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({ id: 'u1' });
    (AuditLog.create as jest.Mock).mockResolvedValue(null);

    await request(app).put('/users/u1').send({ name: 'A' });

    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 'a1',
        action: 'Update',
        module: 'User',
      })
    );
  });

  it('logs organizer status change', async () => {
    (Organizer.findByIdAndUpdate as jest.Mock).mockResolvedValue({ id: 'o1' });
    (AuditLog.create as jest.Mock).mockResolvedValue(null);

    await request(app)
      .patch('/organizers/o1/status')
      .send({ status: 'Verified' });

    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 'a1',
        action: 'Update',
        module: 'Organizer',
      })
    );
  });

  it('returns audit logs', async () => {
    const sortMock = jest.fn().mockResolvedValue([{ id: 'log1' }]);
    (AuditLog.find as jest.Mock).mockReturnValue({ sort: sortMock });

    const res = await request(app).get('/audit-logs');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'log1' }]);
    expect(sortMock).toHaveBeenCalledWith({ timestamp: -1 });
  });

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
});
