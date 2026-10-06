const express = require("express");
const cors = require("cors");
const trackRoutes = require("./routes/track.routes");
const shortcutRoutes = require("./routes/shortcut.routes");
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const app = express();
// 1. Global middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));
// 2. Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/itunes", async (req, res, next) => {
  try {
    if (req.query.artistId) {
      const response = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(req.query.artistId)}&entity=song&country=JP&limit=25`);
      if (!response.ok) throw new Error("iTunes request failed");
      return res.json(await response.json());
    }
    const params = new URLSearchParams({ term: String(req.query.term || ""), country: "JP", media: "music", entity: String(req.query.entity || "song"), limit: String(Math.min(Number(req.query.limit) || 10, 25)) });
    const response = await fetch(`https://itunes.apple.com/search?${params}`);
    if (!response.ok) throw new Error("iTunes request failed");
    res.json(await response.json());
  } catch (error) { next(error); }
});
app.use("/api/tracks", trackRoutes);
app.use("/api/shortcuts", shortcutRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
// 3. Error handling — must be LAST
app.use(notFound);
app.use(errorHandler);
module.exports = app;
