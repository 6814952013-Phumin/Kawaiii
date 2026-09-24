const Shortcut = require("../models/shortcut.model");

const getShortcuts = async (req, res, next) => {
    try {
        const shortcuts = await Shortcut.find().sort({ createdAt: 1 });
        res.json(shortcuts);
    } catch (error) {
        next(error);
    }
};

const createShortcut = async (req, res, next) => {
    try {
        const shortcut = await Shortcut.create(req.body);
        res.status(201).json(shortcut);
    } catch (error) {
        next(error);
    }
};

const deleteShortcut = async (req, res, next) => {
    try {
        const shortcut = await Shortcut.findByIdAndDelete(req.params.id);
        if (!shortcut) return res.status(404).json({ message: "Shortcut not found" });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

const updateShortcut = async (req, res, next) => {
    try {
        const { name, url, color, icon, imageUrl } = req.body;
        const shortcut = await Shortcut.findByIdAndUpdate(
            req.params.id,
            { name, url, color, icon, imageUrl },
            { new: true, runValidators: true }
        );
        if (!shortcut) return res.status(404).json({ message: "Shortcut not found" });
        res.json(shortcut);
    } catch (error) {
        next(error);
    }
};

module.exports = { getShortcuts, createShortcut, updateShortcut, deleteShortcut };
