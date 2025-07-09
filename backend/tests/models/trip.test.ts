import Trip from '../../src/models/trip';

test('trip schema has slug', () => {
  expect(Trip.schema.path('slug')).toBeDefined();
});

test('trip schema has itinerary and featured flags', () => {
  expect(Trip.schema.path('itinerary')).toBeDefined();
  expect(Trip.schema.path('difficulty')).toBeDefined();
  expect(Trip.schema.path('isFeatured')).toBeDefined();
});
