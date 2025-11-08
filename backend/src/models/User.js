const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: {
        type: String,
        enum: ["patient", "doctor", "staff"],
        default: "patient",
    },
    phone: { type: String, default: "" },
    specialization: { type: String, default: "" },
    experience: { type: Number, default: 0 },
    licenseNumber: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);