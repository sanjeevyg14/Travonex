import Organizer from '../../src/models/organizer';

test('organizer schema has pan field', () => {
  expect(Organizer.schema.path('pan')).toBeDefined();
});

test('organizer schema has firebaseUid field', () => {
  expect(Organizer.schema.path('firebaseUid')).toBeDefined();
});
