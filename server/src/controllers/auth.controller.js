const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
    return process.env.JWT_SECRET;
};

const createToken = (userId) => jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: "7d" });

const sendSession = (res, user, statusCode = 200) => {
    res.status(statusCode).json({ token: createToken(user.id), user: user.toJSON() });
};

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required" });
        if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
        const normalizedEmail = email.trim().toLowerCase();
        if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: "This email is already registered" });
        const user = await User.create({ name, email: normalizedEmail, password });
        sendSession(res, user, 201);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email?.trim().toLowerCase() }).select("+password");
        if (!user || !(await user.comparePassword(password || ""))) return res.status(401).json({ message: "Email or password is incorrect" });
        if (!user.isActive) return res.status(403).json({ message: "This account is inactive" });
        user.lastLoginAt = new Date();
        await user.save();
        sendSession(res, user);
    } catch (error) {
        next(error);
    }
};

const getCurrentUser = (req, res) => res.json({ user: req.user.toJSON() });

const updateCurrentUser = async (req, res, next) => {
    try {
        const allowedFields = ["name", "bio", "avatar"];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) req.user[field] = req.body[field];
        });
        await req.user.save();
        res.json({ user: req.user.toJSON() });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getCurrentUser, updateCurrentUser };
