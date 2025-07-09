import User from '../../src/models/user';

test('user schema has firebaseUid field', () => {
  expect(User.schema.path('firebaseUid')).toBeDefined();
});
