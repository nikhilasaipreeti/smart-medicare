const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Staff = require("../models/Staff");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Patient Registration
router.post("/register", async(req, res) => {
    try {
        const { firstName, lastName, email, password, phone, dateOfBirth, gender, address } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "First name, last name, email, and password are required"
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const newUser = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            userType: "patient",
            phone
        });

        await newUser.save();

        // Create Patient Profile
        const patientProfile = new Patient({
            userId: newUser._id,
            dateOfBirth,
            gender,
            address
        });

        await patientProfile.save();

        const token = jwt.sign({
                userId: newUser._id,
                email: newUser.email,
                userType: newUser.userType,
            },
            process.env.JWT_SECRET || "medicare_secret_key_2024", { expiresIn: "24h" }
        );

        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            token,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                userType: newUser.userType,
                phone: newUser.phone
            }
        });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
});

// Login for all users (Patients, Doctors, Staff)
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Get additional profile based on user type
        let userProfile = null;
        if (user.userType === 'doctor') {
            userProfile = await Doctor.findOne({ userId: user._id }).populate('userId');
        } else if (user.userType === 'patient') {
            userProfile = await Patient.findOne({ userId: user._id }).populate('userId');
        } else if (user.userType === 'staff') {
            userProfile = await Staff.findOne({ userId: user._id }).populate('userId');
        }

        const token = jwt.sign({
                userId: user._id,
                email: user.email,
                userType: user.userType,
            },
            process.env.JWT_SECRET || "medicare_secret_key_2024", { expiresIn: "24h" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userType: user.userType,
                phone: user.phone
            },
            profile: userProfile
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
});

// Get current user profile
router.get("/me", authenticateToken, async(req, res) => {
    try {
        let profile = null;

        if (req.user.userType === 'doctor') {
            profile = await Doctor.findOne({ userId: req.user._id }).populate('userId');
        } else if (req.user.userType === 'patient') {
            profile = await Patient.findOne({ userId: req.user._id }).populate('userId');
        } else if (req.user.userType === 'staff') {
            profile = await Staff.findOne({ userId: req.user._id }).populate('userId');
        }

        res.json({
            success: true,
            user: req.user,
            profile: profile
        });
    } catch (error) {
        console.error("❌ Profile fetch error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
});



// Generate JWT token
const generateToken = (user) => {
    return jwt.sign({
            userId: user._id,
            email: user.email,
            userType: user.userType,
        },
        process.env.JWT_SECRET || "medicare_secret_key_2024", { expiresIn: "24h" }
    );
};

// Verify token (alternative implementation)
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || "medicare_secret_key_2024");
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Get user from token
const getUserFromToken = async(token) => {
    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        return user;
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    getUserFromToken
};