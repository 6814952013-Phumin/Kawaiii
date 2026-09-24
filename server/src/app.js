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
app.use("/api/tracks", trackRoutes);
app.use("/api/shortcuts", shortcutRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
// 3. Error handling — must be LAST
app.use(notFound);
app.use(errorHandler);
module.exports = app;
