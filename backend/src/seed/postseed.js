const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/MediCareDb";

// Define the same schemas as in server.js
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
    createdAt: { type: Date, default: Date.now },
});

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialization: { type: String, required: true },
    qualification: { type: String, default: "MD" },
    licenseNumber: { type: String, required: true },
    experience: { type: Number, required: true },
    department: { type: String, required: true },
    consultationFee: { type: Number, default: 100 },
    isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

// Register models
const User = mongoose.model("User", userSchema);
const Doctor = mongoose.model("Doctor", doctorSchema);

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB for seeding");

        // Clear existing data
        await User.deleteMany({});
        await Doctor.deleteMany({});

        console.log("🗑️ Old data cleared");

        // ========================
        // 👨‍⚕️ CREATE DOCTORS
        // ========================
        const doctorsData = [{
                firstName: "Arjun",
                lastName: "Rao",
                email: "arjunrao@hospital.com",
                password: "doctor123",
                phone: "9001110001",
                specialization: "Cardiology",
                experience: 10,
                licenseNumber: "DOC001"
            },
            {
                firstName: "Neha",
                lastName: "Singh",
                email: "neha@hospital.com",
                password: "doctor123",
                phone: "9001110002",
                specialization: "Neurology",
                experience: 8,
                licenseNumber: "DOC002"
            },
            {
                firstName: "Rajesh",
                lastName: "Gupta",
                email: "rajesh@hospital.com",
                password: "doctor123",
                phone: "9001110003",
                specialization: "Orthopedics",
                experience: 12,
                licenseNumber: "DOC003"
            },
            {
                firstName: "Priya",
                lastName: "Sharma",
                email: "priya@hospital.com",
                password: "doctor123",
                phone: "9001110004",
                specialization: "Pediatrics",
                experience: 7,
                licenseNumber: "DOC004"
            }
        ];

        for (const docData of doctorsData) {
            const hashedPassword = await bcrypt.hash(docData.password, 10);

            const user = new User({
                firstName: docData.firstName,
                lastName: docData.lastName,
                email: docData.email,
                password: hashedPassword,
                userType: "doctor",
                phone: docData.phone,
                specialization: docData.specialization,
                experience: docData.experience,
                licenseNumber: docData.licenseNumber
            });

            await user.save();

            const doctor = new Doctor({
                userId: user._id,
                specialization: docData.specialization,
                qualification: "MD",
                licenseNumber: docData.licenseNumber,
                experience: docData.experience,
                department: docData.specialization,
                consultationFee: Math.floor(Math.random() * 300) + 300,
                isAvailable: true
            });

            await doctor.save();
            console.log(`✅ Created doctor: Dr. ${docData.firstName} ${docData.lastName}`);
        }

        // ========================
        // 👥 CREATE PATIENTS
        // ========================
        const patientsData = [{
                firstName: "Rohan",
                lastName: "Sharma",
                email: "rohan@gmail.com",
                password: "patient123",
                phone: "9876543210"
            },
            {
                firstName: "Anjali",
                lastName: "Verma",
                email: "anjali@gmail.com",
                password: "patient123",
                phone: "9897456321"
            }
        ];

        for (const patData of patientsData) {
            const hashedPassword = await bcrypt.hash(patData.password, 10);

            const user = new User({
                firstName: patData.firstName,
                lastName: patData.lastName,
                email: patData.email,
                password: hashedPassword,
                userType: "patient",
                phone: patData.phone
            });

            await user.save();
            console.log(`✅ Created patient: ${patData.firstName} ${patData.lastName}`);
        }

        // ========================
        // 👨‍💼 CREATE STAFF
        // ========================
        const staffData = [{
                firstName: "Admin",
                lastName: "User",
                email: "admin@medicare.com",
                password: "admin123",
                phone: "1234567890"
            },
            {
                firstName: "Reception",
                lastName: "Staff",
                email: "reception@medicare.com",
                password: "reception123",
                phone: "0987654321"
            }
        ];

        for (const staffDataItem of staffData) {
            const hashedPassword = await bcrypt.hash(staffDataItem.password, 10);

            const user = new User({
                firstName: staffDataItem.firstName,
                lastName: staffDataItem.lastName,
                email: staffDataItem.email,
                password: hashedPassword,
                userType: "staff",
                phone: staffDataItem.phone
            });

            await user.save();
            console.log(`✅ Created staff: ${staffDataItem.email}`);
        }

        console.log("\n🎉 SEEDING COMPLETED SUCCESSFULLY!");
        console.log("\n📋 LOGIN CREDENTIALS:");
        console.log("👨‍⚕️ DOCTORS:");
        doctorsData.forEach(doctor => {
            console.log(`   ${doctor.email} / doctor123`);
        });
        console.log("\n👥 PATIENTS:");
        patientsData.forEach(patient => {
            console.log(`   ${patient.email} / patient123`);
        });
        console.log("\n👨‍💼 STAFF:");
        staffData.forEach(staff => {
            console.log(`   ${staff.email} / ${staff.password}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
}

seed();