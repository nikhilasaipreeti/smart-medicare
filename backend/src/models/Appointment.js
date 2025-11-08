const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    notes: { type: String, default: '' },
    prescription: {
        medicines: [{
            name: String,
            dosage: String,
            duration: String
        }],
        instructions: String
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);