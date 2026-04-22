import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Tournament from './src/models/Tournament';

dotenv.config();

const fixPaths = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');

        const tournaments = await Tournament.find({ imageUrl: { $regex: /^\/uploads\/banner-/ } });
        console.log(`Found ${tournaments.length} tournaments with legacy paths`);

        for (const t of tournaments) {
            const oldPath = t.imageUrl;
            const newPath = oldPath.replace('/uploads/', '/uploads/banners/');
            t.imageUrl = newPath;
            await t.save();
            console.log(`Updated: ${oldPath} -> ${newPath}`);
        }

        console.log('All paths fixed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing paths:', err);
        process.exit(1);
    }
};

fixPaths();
