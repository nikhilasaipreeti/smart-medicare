// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ✅ Register
router.post("/register", async(req, res) => {
    try {
        const { firstName, lastName, email, password, userType, phone } = req.body;

        if (await User.findOne({ email })) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashPass,
            userType,
            phone
        });

        const token = jwt.sign({ userId: user._id, userType: user.userType },
            process.env.JWT_SECRET, { expiresIn: "24h" }
        );

        res.json({ success: true, message: "Registered", token, user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// ✅ Login
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ success: false, message: "Invalid email or password" });

        const token = jwt.sign({ userId: user._id, userType: user.userType },
            process.env.JWT_SECRET, { expiresIn: "24h" }
        );

        res.json({ success: true, message: "Login successful", token, user });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;