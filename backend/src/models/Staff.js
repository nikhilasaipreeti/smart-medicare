const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: { type: String, required: true },
    position: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    shift: { type: String, enum: ['Morning', 'Evening', 'Night'] },
    salary: { type: Number },
    joiningDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);