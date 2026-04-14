import mongoose from 'mongoose';
import Tournament from './src/models/Tournament';
import dotenv from 'dotenv';
dotenv.config();
async function checkAll() {
  await mongoose.connect(process.env.MONGO_URI!);
  const all = await Tournament.find({});
  all.forEach(t => {
    console.log(`Tournament: "${t.title}" | ID: ${t._id} | teamSize: ${t.teamSize}`);
  });
  await mongoose.disconnect();
}
checkAll();
