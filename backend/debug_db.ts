import mongoose from 'mongoose';
import Tournament from './src/models/Tournament';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function debugUpdate() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/tourney";
    console.log("Connecting to:", mongoUri);
    await mongoose.connect(mongoUri);
    
    const tournament = await Tournament.findOne({ title: { $regex: /test/i } });
    if (!tournament) {
      console.log("No tournament found with 'test' in title");
      process.exit(1);
    }
    
    console.log("Found tournament:", tournament.title);
    console.log("Current teamSize:", tournament.teamSize);
    
    console.log("Updating teamSize to 8...");
    tournament.teamSize = 8;
    const updated = await tournament.save();
    
    console.log("Updated teamSize in document:", updated.teamSize);
    
    const doubleCheck = await Tournament.findById(tournament._id);
    console.log("Double check from DB:", doubleCheck?.teamSize);
    
    if (doubleCheck?.teamSize === 8) {
      console.log("SUCCESS: Database persistence confirmed.");
    } else {
      console.log("FAILURE: Database persistence failed!");
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

debugUpdate();
