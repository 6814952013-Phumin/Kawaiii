const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../server/.env") });

let databaseConnection;
let app;
let connectDB;

module.exports = async (req, res) => {
    try {
        app ||= require("../server/src/app");
        connectDB ||= require("../server/src/config/db");
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
