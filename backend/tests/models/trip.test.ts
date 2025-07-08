import Trip from '../../src/models/trip';

test('trip schema has slug', () => {
  expect(Trip.schema.path('slug')).toBeDefined();
});
