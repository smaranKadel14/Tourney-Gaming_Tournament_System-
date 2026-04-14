import mongoose from 'mongoose';
import Tournament from './src/models/Tournament';
import dotenv from 'dotenv';
dotenv.config();

async function testFinal() {
  await mongoose.connect(process.env.MONGO_URI!);
  const t = await Tournament.findOne({ title: /test/i });
  if (t) {
    console.log("Found:", t.title, "Current size:", t.teamSize);
    t.set("teamSize", 12);
    t.markModified("teamSize");
    await t.save();
    console.log("Updated to 12. Double checking...");
    const t2 = await Tournament.findById(t._id);
    console.log("Final check from DB:", t2?.teamSize);
  }
  await mongoose.disconnect();
}
testFinal();
