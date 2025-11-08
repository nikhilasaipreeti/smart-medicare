const express = require("express");
const Patient = require("../models/Patient");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const { authenticateToken, roleAccess } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all patients (Staff only)
router.get("/", authenticateToken, roleAccess(['staff', 'doctor']), async(req, res) => {
    try {
        const patients = await Patient.find()
            .populate('userId', 'firstName lastName email phone')
            .select('-medicalHistory');

        res.json({
            success: true,
            data: patients,
            count: patients.length
        });
    } catch (error) {
        console.error("❌ Error fetching patients:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching patients"
        });
    }
});

// Get patient by ID
router.get("/:id", authenticateToken, async(req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate('userId', 'firstName lastName email phone');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Check if user has permission to view this patient
        if (req.user.userType === 'patient' && patient.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error("❌ Error fetching patient:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching patient"
        });
    }
});

// Get current patient's profile
router.get("/profile/me", authenticateToken, roleAccess(['patient']), async(req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user._id })
            .populate('userId', 'firstName lastName email phone');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error("❌ Error fetching patient profile:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
});

// Update patient profile
router.put("/:id", authenticateToken, async(req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Check permission
        if (req.user.userType === 'patient' && patient.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true, runValidators: true }
        ).populate('userId', 'firstName lastName email phone');

        res.json({
            success: true,
            message: "Patient updated successfully",
            data: updatedPatient
        });
    } catch (error) {
        console.error("❌ Error updating patient:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating patient"
        });
    }
});

// Get patient's appointments
router.get("/:id/appointments", authenticateToken, async(req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Check permission
        if (req.user.userType === 'patient' && patient.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const appointments = await Appointment.find({ patientId: req.params.id })
            .populate('doctorId')
            .populate('patientId')
            .sort({ appointmentDate: -1 });

        res.json({
            success: true,
            data: appointments,
            count: appointments.length
        });
    } catch (error) {
        console.error("❌ Error fetching patient appointments:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching appointments"
        });
    }
});

// Delete patient (Staff only)
router.delete("/:id", authenticateToken, roleAccess(['staff']), async(req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Also deactivate the user account
        await User.findByIdAndUpdate(patient.userId, { isActive: false });
        await Patient.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Patient deleted successfully"
        });
    } catch (error) {
        console.error("❌ Error deleting patient:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting patient"
        });
    }
});

module.exports = router;