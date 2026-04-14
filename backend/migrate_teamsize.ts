import mongoose from 'mongoose';
import Tournament from './src/models/Tournament';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB for migration.");
    
    // Update all tournaments where teamSize is 1 or missing
    const result = await Tournament.updateMany(
      { $or: [{ teamSize: 1 }, { teamSize: { $exists: false } }] },
      { $set: { teamSize: 5 } }
    );
    
    console.log(`Migration complete. Updated ${result.modifiedCount} tournaments to teamSize: 5.`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Migration error:", error);
  }
}

migrate();
