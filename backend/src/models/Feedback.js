const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    category: {
        type: String,
        enum: ['Service', 'Doctor', 'Facility', 'General'],
        default: 'General'
    },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);