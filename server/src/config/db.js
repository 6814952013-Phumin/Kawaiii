const mongoose = require("mongoose");

let connectionPromise;

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured in the deployment environment");
    }
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    if (connectionPromise) return connectionPromise;

    connectionPromise = mongoose.connect(process.env.MONGO_URI).catch((error) => {
        connectionPromise = undefined;
        throw error;
    });

    try {
        await connectionPromise;
        console.log("MongoDB connected");
        return mongoose.connection;
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};
module.exports = connectDB;
