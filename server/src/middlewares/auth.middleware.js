const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : null;
        if (!token) return res.status(401).json({ message: "Authentication required" });
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub);
        if (!user || !user.isActive) return res.status(401).json({ message: "Session is no longer valid" });
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") return res.status(401).json({ message: "Invalid or expired session" });
        next(error);
    }
};

module.exports = { requireAuth };
