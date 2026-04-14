import mongoose from 'mongoose';
import Tournament from './src/models/Tournament';
import dotenv from 'dotenv';
dotenv.config();
async function check() {
  await mongoose.connect(process.env.MONGO_URI!);
  const t = await Tournament.findOne({ title: /test/i });
  console.log("Tournament:", t?.title, "teamSize:", t?.teamSize);
  await mongoose.disconnect();
}
check();
