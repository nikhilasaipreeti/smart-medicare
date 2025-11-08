const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    department: {
        type: String,
        required: true
    },
    consultationFee: {
        type: Number,
        required: true,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    totalPatients: {
        type: Number,
        default: 0
    },
    shiftTiming: {
        morning: {
            start: { type: String, default: "09:00" },
            end: { type: String, default: "12:00" }
        },
        evening: {
            start: { type: String, default: "17:00" },
            end: { type: String, default: "20:00" }
        }
    }
}, {
    timestamps: true
});

// Remove the index calls if they cause issues
// doctorSchema.index({ userId: 1 });
// doctorSchema.index({ specialization: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);