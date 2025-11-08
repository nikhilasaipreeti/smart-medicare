// =============================
// 🏥 MediCare+ Backend Server
// =============================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const app = express();

// =============================
// 🔧 Middleware
// =============================
app.use(
    cors({
        origin: [
            "https://smart-medicare-f.onrender.com", // your deployed frontend
            "http://localhost:5173", 
            "http://127.0.0.1:5173"
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
// Serve static files from current directory
app.use(express.static(__dirname));

// Mount payment routes
const paymentRoutes = require("./src/routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

// =============================
// 👤 User Schema & Model
// =============================
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

const User = mongoose.model("User", userSchema);

// =============================
// 👨‍⚕️ Doctor Schema
// =============================
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

const Doctor = mongoose.model("Doctor", doctorSchema);

// =============================
// Patient Schema
// =============================
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
    }
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);

// =============================
// Appointment Schema
// =============================
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
    notes: { type: String, default: '' }
}, { timestamps: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);

// =============================
// Feedback Schema
// =============================
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
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    category: {
        type: String,
        enum: ['Service', 'Doctor', 'Facility', 'General'],
        default: 'General'
    }
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

// =============================
// Staff Schema
// =============================
const staffSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: { type: String, required: true },
    position: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    shift: { type: String, enum: ['Morning', 'Evening', 'Night'] }
}, { timestamps: true });

const Staff = mongoose.model("Staff", staffSchema);

// =============================
// 🧾 Registration Routes
// =============================
app.get("/api/register", (req, res) => {
    res.json({
        message: "Register endpoint - Use POST to create a new account",
        endpoint: "POST /api/register",
    });
});

app.post("/api/register", async(req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            userType,
            phone,
            specialization,
            experience,
            licenseNumber,
        } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "First name, last name, email, and password are required",
            });
        }

        // Additional validation for doctors
        if (userType === 'doctor') {
            if (!specialization || !experience || !licenseNumber) {
                return res.status(400).json({
                    success: false,
                    message: "Specialization, experience, and license number are required for doctor registration"
                });
            }
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            userType: userType || "patient",
            phone,
            specialization,
            experience,
            licenseNumber,
        });

        await newUser.save();

        // Create doctor profile if user is doctor
        if (userType === 'doctor') {
            const doctorProfile = new Doctor({
                userId: newUser._id,
                specialization: specialization,
                qualification: "MD",
                licenseNumber: licenseNumber,
                experience: experience,
                department: specialization,
                consultationFee: 100
            });
            await doctorProfile.save();
            console.log("✅ Doctor profile created for:", newUser.email);
        }

        const token = jwt.sign({
                userId: newUser._id,
                email: newUser.email,
                userType: newUser.userType,
            },
            process.env.JWT_SECRET || "medicare_secret_key_2024", { expiresIn: "24h" }
        );

        res.status(201).json({
            success: true,
            message: userType === 'doctor' ? "Doctor registered successfully" : "User registered successfully",
            token,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                userType: newUser.userType,
                phone: newUser.phone,
                specialization: newUser.specialization,
                experience: newUser.experience,
                licenseNumber: newUser.licenseNumber,
            },
        });
    } catch (error) {
        console.error("❌ Registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error during registration",
        });
    }
});

// =============================
// 🔥 Login Route
// =============================
app.post("/api/login", async(req, res) => {
    console.log("🔐 Login request received");

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Get doctor profile if user is doctor
        let doctorProfile = null;
        if (user.userType === 'doctor') {
            doctorProfile = await Doctor.findOne({ userId: user._id })
                .populate('userId', 'firstName lastName email phone');
        }

        const token = jwt.sign({
                userId: user._id,
                email: user.email,
                userType: user.userType,
            },
            process.env.JWT_SECRET || "medicare_secret_key_2024", { expiresIn: "24h" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userType: user.userType,
                phone: user.phone,
                specialization: user.specialization,
                experience: user.experience,
                licenseNumber: user.licenseNumber,
            },
            doctorProfile: doctorProfile
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login",
        });
    }
});

// =============================
// 👨‍⚕️ Doctor Routes
// =============================

// GET doctor by user ID
app.get("/api/doctors/user/:userId", async(req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.params.userId })
            .populate('userId', 'firstName lastName email phone');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching doctor'
        });
    }
});

// GET all doctors
app.get("/api/doctors", async(req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'firstName lastName email phone');

        res.json({
            success: true,
            data: doctors,
            count: doctors.length
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        // Fallback to sample data
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
            }
        ];
        res.json({
            success: true,
            data: doctors,
            count: doctors.length
        });
    }
});

// =============================
// 🆕 PATIENT ROUTES
// =============================

// Get all patients
app.get("/api/patients", async(req, res) => {
    try {
        const patients = await Patient.find().populate('userId', 'firstName lastName email phone');
        res.json({
            success: true,
            data: patients,
            count: patients.length
        });
    } catch (error) {
        console.error("❌ Error fetching patients:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching patients"
        });
    }
});

// Get patient by ID
app.get("/api/patients/:id", async(req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).populate('userId', 'firstName lastName email phone');
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }
        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error("❌ Error fetching patient:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching patient"
        });
    }
});

// =============================
// 🆕 APPOINTMENT ROUTES
// =============================

// Get all appointments
app.get("/api/appointments", async(req, res) => {
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

// Create appointment
app.post("/api/appointments", async(req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;

        if (!patientId || !doctorId || !appointmentDate || !appointmentTime || !reason) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newAppointment = new Appointment({
            patientId,
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

// =============================
// 🆕 FEEDBACK ROUTES
// =============================

// Get all feedback
app.get("/api/feedback", async(req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate('patientId')
            .populate('doctorId')
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

// Create feedback
app.post("/api/feedback", async(req, res) => {
    try {
        const { patientId, doctorId, rating, comment, category } = req.body;

        if (!patientId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Patient ID and rating are required"
            });
        }

        const newFeedback = new Feedback({
            patientId,
            doctorId,
            rating,
            comment,
            category
        });

        await newFeedback.save();

        const populatedFeedback = await Feedback.findById(newFeedback._id)
            .populate('patientId')
            .populate('doctorId');

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

// =============================
// 🆕 STAFF ROUTES
// =============================

// Get all staff
app.get("/api/staff", async(req, res) => {
    try {
        const staff = await Staff.find().populate('userId', 'firstName lastName email phone');
        res.json({
            success: true,
            data: staff,
            count: staff.length
        });
    } catch (error) {
        console.error("❌ Error fetching staff:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching staff"
        });
    }
});

// =============================
// 🆕 DOCTOR STATISTICS & APPOINTMENT COUNTS
// =============================

// Get doctor statistics with appointment counts
app.get("/api/doctors-with-stats", async(req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'firstName lastName email phone');

        // Get appointment counts for each doctor
        const doctorsWithStats = await Promise.all(
            doctors.map(async(doctor) => {
                const appointmentCount = await Appointment.countDocuments({
                    doctorId: doctor._id
                });

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todayAppointments = await Appointment.countDocuments({
                    doctorId: doctor._id,
                    appointmentDate: {
                        $gte: today,
                        $lt: tomorrow
                    }
                });

                const pendingAppointments = await Appointment.countDocuments({
                    doctorId: doctor._id,
                    status: 'Scheduled'
                });

                const completedAppointments = await Appointment.countDocuments({
                    doctorId: doctor._id,
                    status: 'Completed'
                });

                return {
                    ...doctor.toObject(),
                    totalAppointments: appointmentCount,
                    todayAppointments: todayAppointments,
                    pendingAppointments: pendingAppointments,
                    completedAppointments: completedAppointments
                };
            })
        );

        res.json({
            success: true,
            data: doctorsWithStats,
            count: doctorsWithStats.length
        });
    } catch (error) {
        console.error('Error fetching doctors with stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching doctors with stats'
        });
    }
});

// Get individual doctor stats
app.get("/api/doctors/:id/stats", async(req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        const appointments = await Appointment.find({ doctorId: req.params.id });
        const feedback = await Feedback.find({ doctorId: req.params.id });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= today && aptDate < tomorrow;
        });

        const stats = {
            totalAppointments: appointments.length,
            todayAppointments: todayAppointments.length,
            pendingAppointments: appointments.filter(apt => apt.status === 'Scheduled').length,
            completedAppointments: appointments.filter(apt => apt.status === 'Completed').length,
            cancelledAppointments: appointments.filter(apt => apt.status === 'Cancelled').length,
            averageRating: feedback.length > 0 ?
                (feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length).toFixed(1) : 0,
            totalFeedback: feedback.length,
            totalPatients: await Appointment.find({ doctorId: req.params.id }).distinct('patientId').then(ids => ids.length)
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("❌ Error fetching doctor stats:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching doctor stats"
        });
    }
});

// Get appointments for specific doctor
app.get("/api/doctors/:id/appointments", async(req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
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
            message: "Server error while fetching doctor appointments"
        });
    }
});

// =============================
// 🧠 MongoDB Connection
// =============================
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/MediCareDb";

mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// =============================
// 🧩 Basic Info Routes
// =============================
app.get("/", (req, res) => {
    res.json({
        message: "🏥 MediCare+ API Server is running!",
        timestamp: new Date().toISOString(),
        version: "2.0.0",
        features: "Enhanced with Patients, Appointments, Feedback & Staff"
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        timestamp: new Date().toISOString(),
    });
});

app.get("/api", (req, res) => {
    res.json({
        message: "Backend API is working!",
        version: "2.0.0",
        endpoints: {
            login: "POST /api/login",
            register: "POST /api/register",
            doctors: "GET /api/doctors",
            patients: "GET /api/patients",
            appointments: "GET /api/appointments, POST /api/appointments",
            feedback: "GET /api/feedback, POST /api/feedback",
            staff: "GET /api/staff",
            health: "GET /health"
        }
    });
});

// =============================
// 🎯 Serve Test HTML Page
// =============================

// Route to serve test.html
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'test.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'test.html'));
});

// =============================
// 🚀 Start Server
// =============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base: http://localhost:${PORT}/api`);
    console.log(`\n🔑 Authentication:`);
    console.log(`   POST http://localhost:${PORT}/api/login`);
    console.log(`   POST http://localhost:${PORT}/api/register`);
    console.log(`\n👥 User Management:`);
    console.log(`   GET  http://localhost:${PORT}/api/doctors`);
    console.log(`   GET  http://localhost:${PORT}/api/patients`);
    console.log(`   GET  http://localhost:${PORT}/api/staff`);
    console.log(`\n📅 Appointments & Feedback:`);
    console.log(`   GET  http://localhost:${PORT}/api/appointments`);
    console.log(`   POST http://localhost:${PORT}/api/appointments`);
    console.log(`   GET  http://localhost:${PORT}/api/feedback`);
    console.log(`   POST http://localhost:${PORT}/api/feedback`);
    console.log(`\n📊 Statistics:`);
    console.log(`   GET  http://localhost:${PORT}/api/doctors-with-stats`);
    console.log(`   GET  http://localhost:${PORT}/api/doctors/:id/stats`);
    console.log(`\n⚡ All routes are now available in one file!`);
});
