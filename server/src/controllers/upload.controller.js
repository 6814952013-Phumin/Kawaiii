const { put } = require("@vercel/blob");
const crypto = require("crypto");
const MediaAsset = require("../models/mediaAsset.model");

const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "An image file is required" });
        }

        const extension = (req.file.originalname.match(/\.[a-z0-9]+$/i) || [""])[0].toLowerCase();
        const filename = `shortcuts/${crypto.randomUUID()}${extension}`;
        const blob = await put(filename, req.file.buffer, {
            access: "public",
            contentType: req.file.mimetype,
            addRandomSuffix: false,
        });
        const asset = await MediaAsset.create({
            originalName: req.file.originalname,
            filename,
            url: blob.url,
            storageProvider: "vercel-blob",
            storageKey: blob.pathname,
            mimeType: req.file.mimetype,
            sizeBytes: req.file.size,
        });

        res.status(201).json({ assetId: asset._id, url: asset.url });
    } catch (error) {
        next(error);
    }
};

module.exports = { uploadImage };
