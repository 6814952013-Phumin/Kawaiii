const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../server/.env") });

let databaseConnection;
let app;
let connectDB;

module.exports = async (req, res) => {
    try {
        // Music discovery is intentionally public and must keep working when the
        // optional application database is not configured on a preview deploy.
        if (req.url?.startsWith("/api/itunes")) {
            const url = new URL(req.url, "https://kawaiii.local");
            const artistId = url.searchParams.get("artistId");
            const upstream = artistId
                ? `https://itunes.apple.com/lookup?id=${encodeURIComponent(artistId)}&entity=song&country=JP&limit=25`
                : `https://itunes.apple.com/search?${new URLSearchParams({ term: url.searchParams.get("term") || "", country: "JP", media: "music", entity: url.searchParams.get("entity") || "song", limit: url.searchParams.get("limit") || "10" })}`;
            const response = await fetch(upstream);
            if (!response.ok) return res.status(response.status).json({ message: "iTunes request failed" });
            return res.status(200).json(await response.json());
        }
        app ||= require("../server/src/app");
        connectDB ||= require("../server/src/config/db");
        databaseConnection ||= connectDB();
        await databaseConnection;
        return app(req, res);
    } catch (error) {
        databaseConnection = undefined;
        console.error("API startup failed:", error);
        return res.status(500).json({
            message: error.message || "Server configuration or database connection failed",
        });
    }
};
