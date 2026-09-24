const express = require("express");
const { getShortcuts, createShortcut, updateShortcut, deleteShortcut } = require("../controllers/shortcut.controller");

const router = express.Router();

router.get("/", getShortcuts);
router.post("/", createShortcut);
router.patch("/:id", updateShortcut);
router.delete("/:id", deleteShortcut);

module.exports = router;
