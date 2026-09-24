const mongoose = require("mongoose");

const siteProfileSchema = new mongoose.Schema(
    {
        siteName: { type: String, required: true, trim: true, maxlength: 80 },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-z0-9-]+$/, "Slug can contain lowercase letters, numbers, and hyphens only"],
        },
        ownerName: { type: String, required: true, trim: true, maxlength: 80 },
        headline: { type: String, trim: true, maxlength: 160 },
        bio: { type: String, trim: true, maxlength: 1000 },
        avatar: { type: mongoose.Schema.Types.ObjectId, ref: "MediaAsset" },
        coverImage: { type: mongoose.Schema.Types.ObjectId, ref: "MediaAsset" },
        timezone: { type: String, default: "Asia/Bangkok", trim: true },
        theme: {
            mode: { type: String, enum: ["light", "dark", "system"], default: "dark" },
            accentColor: { type: String, default: "#00c6e6", match: [/^#[0-9a-fA-F]{6}$/, "Use a hex color"] },
        },
        isPublished: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SiteProfile", siteProfileSchema);
