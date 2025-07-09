import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trip from '../src/models/trip';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');

  await Trip.updateMany({}, {
    $set: {
      itinerary: [],
      difficulty: '',
      isFeatured: false,
      isFeaturedRequest: false
    }
  });

  console.log('Migration completed');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
