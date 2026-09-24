const mongoose = require("mongoose");

const shortcutSchema = new mongoose.Schema(
    {
        site: { type: mongoose.Schema.Types.ObjectId, ref: "SiteProfile" },
        name: { type: String, required: true, trim: true, maxlength: 50 },
        description: { type: String, trim: true, maxlength: 180 },
        url: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (value) => /^(https?:\/\/|mailto:|tel:)/.test(value),
                message: "URL must start with http(s), mailto, or tel",
            },
        },
        color: { type: String, default: "#00c6e6" },
        icon: { type: String, maxlength: 2 },
        imageUrl: { type: String, trim: true, maxlength: 900000 },
        image: { type: mongoose.Schema.Types.ObjectId, ref: "MediaAsset" },
        category: {
            type: String,
            enum: ["shortcut", "social", "portfolio", "resource"],
            default: "shortcut",
        },
        position: { type: Number, default: 0, min: 0 },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

shortcutSchema.index({ site: 1, category: 1, position: 1 });

module.exports = mongoose.model("Shortcut", shortcutSchema);
