import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user';
import Organizer from '../src/models/organizer';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');

  const users = await User.find({ firebaseUid: { $exists: false } });
  for (const u of users) {
    u.firebaseUid = u.id.toString();
    await u.save();
  }

  const organizers = await Organizer.find({ firebaseUid: { $exists: false } });
  for (const o of organizers) {
    o.firebaseUid = o.id.toString();
    await o.save();
  }

  console.log('Migration completed');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
