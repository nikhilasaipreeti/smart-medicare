const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    medicalHistory: [{
        condition: String,
        diagnosedDate: Date,
        status: String
    }]
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);