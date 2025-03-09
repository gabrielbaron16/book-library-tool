import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:secret@localhost:27017";

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            authSource: "admin"
        });
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
};