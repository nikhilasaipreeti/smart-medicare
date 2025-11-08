const express = require("express");
const User = require("../models/User");
const { authenticateToken, roleAccess } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users (Staff only)
router.get("/", authenticateToken, roleAccess(['staff']), async(req, res) => {
    try {
        const users = await User.find().select('-password');

        res.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching users"
        });
    }
});

// Get user by ID
router.get("/:id", authenticateToken, async(req, res) => {
    try {
        // Users can only view their own profile unless they are staff
        if (req.user.userType !== 'staff' && req.params.id !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("❌ Error fetching user:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching user"
        });
    }
});

// Update user profile
router.put("/:id", authenticateToken, async(req, res) => {
    try {
        // Users can only update their own profile unless they are staff
        if (req.user.userType !== 'staff' && req.params.id !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const { password, email, userType, ...updateData } = req.body;

        // Prevent changing email and userType for non-staff
        if (req.user.userType !== 'staff') {
            if (email || userType) {
                return res.status(403).json({
                    success: false,
                    message: "Cannot change email or user type"
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData, { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("❌ Error updating user:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating user"
        });
    }
});

// Delete user (Staff only)
router.delete("/:id", authenticateToken, roleAccess(['staff']), async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent self-deletion
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Cannot delete your own account"
            });
        }

        // Soft delete - mark as inactive
        await User.findByIdAndUpdate(req.params.id, { isActive: false });

        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("❌ Error deleting user:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting user"
        });
    }
});

// Get user dashboard data
router.get("/:id/dashboard", authenticateToken, async(req, res) => {
    try {
        // Users can only view their own dashboard
        if (req.params.id !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const user = await User.findById(req.user._id).select('-password');

        let dashboardData = {
            user: user,
            stats: {}
        };

        // Add role-specific dashboard data
        if (user.userType === 'patient') {
            const Patient = require('../models/Patient');
            const Appointment = require('../models/Appointment');

            const patient = await Patient.findOne({ userId: user._id });
            const appointments = await Appointment.find({ patientId: patient._id });

            dashboardData.stats = {
                totalAppointments: appointments.length,
                upcomingAppointments: appointments.filter(apt =>
                    new Date(apt.appointmentDate) > new Date() && apt.status !== 'Cancelled'
                ).length,
                completedAppointments: appointments.filter(apt =>
                    apt.status === 'Completed'
                ).length
            };
            dashboardData.profile = patient;
        } else if (user.userType === 'doctor') {
            const Doctor = require('../models/Doctor');
            const Appointment = require('../models/Appointment');

            const doctor = await Doctor.findOne({ userId: user._id });
            const appointments = await Appointment.find({ doctorId: doctor._id });

            dashboardData.stats = {
                totalAppointments: appointments.length,
                todayAppointments: appointments.filter(apt =>
                    new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
                ).length,
                pendingAppointments: appointments.filter(apt =>
                    apt.status === 'Scheduled'
                ).length
            };
            dashboardData.profile = doctor;
        } else if (user.userType === 'staff') {
            const Staff = require('../models/Staff');
            const User = require('../models/User');
            const Appointment = require('../models/Appointment');

            const staff = await Staff.findOne({ userId: user._id });
            const totalUsers = await User.countDocuments();
            const totalAppointments = await Appointment.countDocuments();

            dashboardData.stats = {
                totalUsers: totalUsers,
                totalAppointments: totalAppointments,
                todayAppointments: await Appointment.countDocuments({
                    appointmentDate: {
                        $gte: new Date().setHours(0, 0, 0, 0),
                        $lt: new Date().setHours(23, 59, 59, 999)
                    }
                })
            };
            dashboardData.profile = staff;
        }

        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error("❌ Error fetching dashboard:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching dashboard"
        });
    }
});

module.exports = router;