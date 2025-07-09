import Organizer from '../../src/models/organizer';

test('organizer schema has pan field', () => {
  expect(Organizer.schema.path('pan')).toBeDefined();
});
