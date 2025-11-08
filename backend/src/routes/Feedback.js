const express = require("express");
const Feedback = require("../models/Feedback");
const Patient = require("../models/Patient");
const { authenticateToken, roleAccess } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all feedback
router.get("/", async(req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate('patientId')
            .populate('doctorId')
            .populate('appointmentId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: feedback,
            count: feedback.length
        });
    } catch (error) {
        console.error("❌ Error fetching feedback:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching feedback"
        });
    }
});

// Get feedback by ID
router.get("/:id", async(req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
            .populate('patientId')
            .populate('doctorId')
            .populate('appointmentId');

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error("❌ Error fetching feedback:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching feedback"
        });
    }
});

// Create new feedback (Patients only)
router.post("/", authenticateToken, roleAccess(['patient']), async(req, res) => {
    try {
        const { doctorId, appointmentId, rating, comment, category } = req.body;

        if (!rating) {
            return res.status(400).json({
                success: false,
                message: "Rating is required"
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

        const newFeedback = new Feedback({
            patientId: patient._id,
            doctorId,
            appointmentId,
            rating,
            comment,
            category
        });

        await newFeedback.save();

        const populatedFeedback = await Feedback.findById(newFeedback._id)
            .populate('patientId')
            .populate('doctorId')
            .populate('appointmentId');

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            data: populatedFeedback
        });
    } catch (error) {
        console.error("❌ Error creating feedback:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating feedback"
        });
    }
});

// Update feedback
router.put("/:id", authenticateToken, async(req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        // Check permission
        if (req.user.userType === 'patient') {
            const patient = await Patient.findOne({ userId: req.user._id });
            if (feedback.patientId.toString() !== patient._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true, runValidators: true }
        ).populate('patientId').populate('doctorId').populate('appointmentId');

        res.json({
            success: true,
            message: "Feedback updated successfully",
            data: updatedFeedback
        });
    } catch (error) {
        console.error("❌ Error updating feedback:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating feedback"
        });
    }
});

// Delete feedback
router.delete("/:id", authenticateToken, async(req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        // Check permission
        if (req.user.userType === 'patient') {
            const patient = await Patient.findOne({ userId: req.user._id });
            if (feedback.patientId.toString() !== patient._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        await Feedback.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Feedback deleted successfully"
        });
    } catch (error) {
        console.error("❌ Error deleting feedback:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting feedback"
        });
    }
});

module.exports = router;