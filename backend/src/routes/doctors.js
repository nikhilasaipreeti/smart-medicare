const express = require("express");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const { authenticateToken, roleAccess } = require("../middleware/authMiddleware");

const router = express.Router();

// Sample doctors data
const doctors = [{
        id: 1,
        name: 'Dr. Sarah Wilson',
        specialty: 'Cardiology',
        availability: 'Available',
        experience: '10 years',
        rating: 4.8
    },
    {
        id: 2,
        name: 'Dr. Michael Chen',
        specialty: 'Neurology',
        availability: 'Available',
        experience: '8 years',
        rating: 4.7
    },
    {
        id: 3,
        name: 'Dr. Emily Davis',
        specialty: 'Pediatrics',
        availability: 'In Surgery',
        experience: '12 years',
        rating: 4.9
    }
];

// Get all doctors
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: doctors,
        count: doctors.length
    });
});


// Get all doctors
router.get("/", async(req, res) => {
    try {
        const doctors = await Doctor.find({ isAvailable: true })
            .populate('userId', 'firstName lastName email phone specialization experience');

        res.json({
            success: true,
            data: doctors,
            count: doctors.length
        });
    } catch (error) {
        console.error("❌ Error fetching doctors:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching doctors"
        });
    }
});

// Get doctor by ID
router.get("/:id", async(req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('userId', 'firstName lastName email phone specialization experience');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error("❌ Error fetching doctor:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching doctor"
        });
    }
});

// Get doctor by user ID
router.get("/user/:userId", async(req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.params.userId })
            .populate('userId', 'firstName lastName email phone specialization experience');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error("❌ Error fetching doctor:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching doctor"
        });
    }
});

// Get current doctor's profile
router.get("/profile/me", authenticateToken, roleAccess(['doctor']), async(req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id })
            .populate('userId', 'firstName lastName email phone specialization experience');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error("❌ Error fetching doctor profile:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
});

// Get doctor's appointments
router.get("/:id/appointments", authenticateToken, async(req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Check permission
        if (req.user.userType === 'doctor' && doctor.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const appointments = await Appointment.find({ doctorId: req.params.id })
            .populate('patientId')
            .populate('doctorId')
            .sort({ appointmentDate: -1 });

        res.json({
            success: true,
            data: appointments,
            count: appointments.length
        });
    } catch (error) {
        console.error("❌ Error fetching doctor appointments:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching appointments"
        });
    }
});

// Update doctor profile
router.put("/:id", authenticateToken, roleAccess(['doctor', 'staff']), async(req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Check permission
        if (req.user.userType === 'doctor' && doctor.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true, runValidators: true }
        ).populate('userId', 'firstName lastName email phone specialization experience');

        res.json({
            success: true,
            message: "Doctor updated successfully",
            data: updatedDoctor
        });
    } catch (error) {
        console.error("❌ Error updating doctor:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating doctor"
        });
    }
});

// Delete doctor (Staff only)
router.delete("/:id", authenticateToken, roleAccess(['staff']), async(req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Also deactivate the user account
        await User.findByIdAndUpdate(doctor.userId, { isActive: false });
        await Doctor.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Doctor deleted successfully"
        });
    } catch (error) {
        console.error("❌ Error deleting doctor:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting doctor"
        });
    }
});

module.exports = router;