const express = require("express");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const { authenticateToken, roleAccess } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all appointments
router.get("/", authenticateToken, roleAccess(['staff', 'doctor']), async(req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId')
            .populate('doctorId')
            .sort({ appointmentDate: -1 });

        res.json({
            success: true,
            data: appointments,
            count: appointments.length
        });
    } catch (error) {
        console.error("❌ Error fetching appointments:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching appointments"
        });
    }
});

// Get appointment by ID
router.get("/:id", authenticateToken, async(req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId')
            .populate('doctorId');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Check permission
        if (req.user.userType === 'patient') {
            const patient = await Patient.findOne({ userId: req.user._id });
            if (appointment.patientId._id.toString() !== patient._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        } else if (req.user.userType === 'doctor') {
            const doctor = await Doctor.findOne({ userId: req.user._id });
            if (appointment.doctorId._id.toString() !== doctor._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error("❌ Error fetching appointment:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching appointment"
        });
    }
});

// Create new appointment (Patients only)
router.post("/", authenticateToken, roleAccess(['patient']), async(req, res) => {
    try {
        const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

        if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID, appointment date, time, and reason are required"
            });
        }

        // Get patient ID from user
        const patient = await Patient.findOne({ userId: req.user._id });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        // Check if doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor || !doctor.isAvailable) {
            return res.status(404).json({
                success: false,
                message: "Doctor not available"
            });
        }

        const newAppointment = new Appointment({
            patientId: patient._id,
            doctorId,
            appointmentDate,
            appointmentTime,
            reason
        });

        await newAppointment.save();

        const populatedAppointment = await Appointment.findById(newAppointment._id)
            .populate('patientId')
            .populate('doctorId');

        res.status(201).json({
            success: true,
            message: "Appointment scheduled successfully",
            data: populatedAppointment
        });
    } catch (error) {
        console.error("❌ Error creating appointment:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating appointment"
        });
    }
});

// Update appointment
router.put("/:id", authenticateToken, async(req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Check permission based on user type
        if (req.user.userType === 'patient') {
            const patient = await Patient.findOne({ userId: req.user._id });
            if (appointment.patientId.toString() !== patient._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
            // Patients can only cancel appointments
            if (req.body.status && req.body.status !== 'Cancelled') {
                return res.status(403).json({
                    success: false,
                    message: "Patients can only cancel appointments"
                });
            }
        } else if (req.user.userType === 'doctor') {
            const doctor = await Doctor.findOne({ userId: req.user._id });
            if (appointment.doctorId.toString() !== doctor._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true, runValidators: true }
        ).populate('patientId').populate('doctorId');

        res.json({
            success: true,
            message: "Appointment updated successfully",
            data: updatedAppointment
        });
    } catch (error) {
        console.error("❌ Error updating appointment:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating appointment"
        });
    }
});

// Delete appointment
router.delete("/:id", authenticateToken, async(req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Check permission
        if (req.user.userType === 'patient') {
            const patient = await Patient.findOne({ userId: req.user._id });
            if (appointment.patientId.toString() !== patient._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        } else if (req.user.userType === 'doctor') {
            const doctor = await Doctor.findOne({ userId: req.user._id });
            if (appointment.doctorId.toString() !== doctor._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        await Appointment.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Appointment deleted successfully"
        });
    } catch (error) {
        console.error("❌ Error deleting appointment:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting appointment"
        });
    }
});

module.exports = router;