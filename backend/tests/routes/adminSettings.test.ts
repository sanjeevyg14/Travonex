import request from 'supertest';
import express from 'express';

jest.mock('../../src/middleware/verifyJwt', () => ({
  verifyJwt: () => (_req: any, _res: any, next: any) => next()
}));

import router from '../../src/routes/adminSettings';
import AdminSetting from '../../src/models/adminSetting';

jest.mock('../../src/models/adminSetting');

const app = express();
app.use(express.json());
app.use(router);

describe('adminSettings routes', () => {
  it('upserts settings for section', async () => {
    (AdminSetting.findOneAndUpdate as jest.Mock).mockResolvedValue({
      section: 'general',
      settings: { enabled: true }
    });

    const res = await request(app)
      .put('/general')
      .send({ enabled: true });

    expect(AdminSetting.findOneAndUpdate).toHaveBeenCalledWith(
      { section: 'general' },
      { section: 'general', settings: { enabled: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    expect(res.status).toBe(200);
    expect(res.body.section).toBe('general');
  });
});
