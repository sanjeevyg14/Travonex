import { verifyJwt } from '../../src/middleware/verifyJwt';
import jwt from 'jsonwebtoken';

describe('verifyJwt', () => {
  it('calls next when token valid', () => {
    const token = 'token';
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: '1', role: 'USER' } as any);
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    verifyJwt('USER')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
