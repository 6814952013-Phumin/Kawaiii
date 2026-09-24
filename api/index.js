const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../server/.env") });
const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");

let databaseConnection;

module.exports = async (req, res) => {
    try {
        databaseConnection ||= connectDB();
        await databaseConnection;
        return app(req, res);
    } catch (error) {
        databaseConnection = undefined;
        console.error("API startup failed:", error);
        return res.status(500).json({
            message: "Server configuration or database connection failed",
        });
    }
};
