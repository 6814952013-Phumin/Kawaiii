const express = require("express");
const multer = require("multer");
const { uploadImage } = require("../controllers/upload.controller");

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 600 * 1024 },
    fileFilter: (req, file, callback) => {
        callback(null, /^image\/(png|jpeg|webp|gif)$/.test(file.mimetype));
    },
});

router.post("/image", upload.single("file"), uploadImage);

module.exports = router;
