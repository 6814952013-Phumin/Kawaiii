const mongoose = require("mongoose");

const mediaAssetSchema = new mongoose.Schema(
    {
        originalName: { type: String, required: true, trim: true },
        filename: { type: String, required: true, trim: true, unique: true },
        url: { type: String, required: true, trim: true },
        storageProvider: {
            type: String,
            enum: ["local", "cloudinary", "s3", "vercel-blob"],
            default: "vercel-blob",
        },
        storageKey: { type: String, trim: true },
        mimeType: {
            type: String,
            required: true,
            validate: {
                validator: (value) => value.startsWith("image/"),
                message: "Only image files are supported",
            },
        },
        sizeBytes: { type: Number, required: true, min: 0 },
        width: { type: Number, min: 1 },
        height: { type: Number, min: 1 },
        altText: { type: String, trim: true, maxlength: 160 },
        tags: [{ type: String, trim: true, lowercase: true }],
    },
    { timestamps: true }
);

mediaAssetSchema.index({ tags: 1 });

module.exports = mongoose.model("MediaAsset", mediaAssetSchema);
