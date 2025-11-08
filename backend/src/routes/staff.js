const express = require("express");
const Staff = require("../models/Staff");
const User = require("../models/user");
const { authenticateToken, roleAccess } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all staff (Staff only)
router.get("/", authenticateToken, roleAccess(['staff']), async(req, res) => {
    try {
        const staff = await Staff.find()
            .populate('userId', 'firstName lastName email phone')
            .select('-salary');

        res.json({
            success: true,
            data: staff,
            count: staff.length
        });
    } catch (error) {
        console.error("❌ Error fetching staff:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching staff"
        });
    }
});

// Get staff by ID
router.get("/:id", authenticateToken, roleAccess(['staff']), async(req, res) => {
    try {
        const staff = await Staff.findById(req.params.id)
            .populate('userId', 'firstName lastName email phone');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        res.json({
            success: true,
            data: staff
        });
    } catch (error) {
        console.error("❌ Error fetching staff:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching staff"
        });
    }
});

// Get current staff profile
router.get("/profile/me", authenticateToken, roleAccess(['staff']), async(req, res) => {
    try {
        const staff = await Staff.findOne({ userId: req.user._id })
            .populate('userId', 'firstName lastName email phone');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff profile not found"
            });
        }

        res.json({
            success: true,
            data: staff
        });
    } catch (error) {
        console.error("❌ Error fetching staff profile:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
});

// Update staff profile
router.put("/:id", authenticateToken, roleAccess(['staff']), async(req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        const updatedStaff = await Staff.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true, runValidators: true }
        ).populate('userId', 'firstName lastName email phone');

        res.json({
            success: true,
            message: "Staff updated successfully",
            data: updatedStaff
        });
    } catch (error) {
        console.error("❌ Error updating staff:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating staff"
        });
    }
});

// Delete staff
router.delete("/:id", authenticateToken, roleAccess(['staff']), async(req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        // Prevent self-deletion
        if (staff.userId.toString() === req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Cannot delete your own account"
            });
        }

        // Also deactivate the user account
        await User.findByIdAndUpdate(staff.userId, { isActive: false });
        await Staff.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Staff deleted successfully"
        });
    } catch (error) {
        console.error("❌ Error deleting staff:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting staff"
        });
    }
});

module.exports = router;