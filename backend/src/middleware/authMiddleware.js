const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async(req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "medicare_secret_key_2024");
        const user = await User.findById(decoded.userId).select('-password');

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User not found or inactive"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

const roleAccess = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions."
            });
        }
        next();
    };
};

module.exports = { authenticateToken, roleAccess };