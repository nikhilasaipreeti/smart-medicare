import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://smart-medicare.onrender.com';
// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Main API object
export const api = {
    // Test backend connection
    testConnection: async() => {
        try {
            const response = await fetch(`${API_BASE_URL}/`);
            const data = await response.json();
            return { success: true, message: 'Backend connected', data };
        } catch (error) {
            console.error('Backend connection failed:', error);
            return {
                success: false,
                message: 'Backend connection failed',
                status: 'disconnected'
            };
        }
    },

    // Health check
    healthCheck: async() => {
        try {
            const response = await fetch(`http://localhost:8080/health`);
            if (!response.ok) throw new Error('Health check failed');
            const data = await response.json();
            return {
                success: true,
                status: data.status || 'OK',
                database: data.database || 'Connected',
                data
            };
        } catch (error) {
            console.error('Health check failed:', error);
            return {
                success: false,
                status: 'Error',
                database: 'Disconnected',
                message: 'Health check failed'
            };
        }
    },

    // Auth routes
    login: async(credentials) => {
        try {
            console.log('🔐 Frontend: Calling login endpoint:', `${API_BASE_URL}/login`);
            console.log('📤 Sending credentials:', { email: credentials.email, password: '***' });

            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Login failed with status: ${response.status}`
                };
            }

            console.log('✅ Login response:', data);

            // Store token and user data in localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return {
                success: true,
                user: data.user,
                token: data.token,
                message: data.message || 'Login successful'
            };

        } catch (error) {
            console.error('❌ Login failed:', error);
            return {
                success: false,
                message: 'Login failed - network error. Please check if backend is running.'
            };
        }
    },

    register: async(userData) => {
        try {
            console.log('🔐 Frontend: Calling register endpoint:', `${API_BASE_URL}/register`);

            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Registration failed with status: ${response.status}`
                };
            }

            console.log('✅ Registration response:', data);

            // Store token and user data in localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return {
                success: true,
                user: data.user,
                token: data.token,
                message: data.message || 'Registration successful'
            };

        } catch (error) {
            console.error('❌ Registration failed:', error);
            return {
                success: false,
                message: 'Registration failed - network error'
            };
        }
    },

    getCurrentUser: async() => {
        try {
            const token = getAuthToken();
            const storedUser = localStorage.getItem('user');

            if (!token || !storedUser) {
                return { success: false, message: 'No authentication data found' };
            }

            // Try to get user from backend first
            try {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                });

                if (response.ok) {
                    const data = await response.json();
                    return { success: true, user: data.user || data };
                }
            } catch (error) {
                console.log('Backend user fetch failed, using stored user:', error);
            }

            // Fallback to stored user data
            const user = JSON.parse(storedUser);
            return { success: true, user };

        } catch (error) {
            console.error('❌ Get current user failed:', error);
            return { success: false, message: 'Failed to get user data' };
        }
    },

    logout: async() => {
        try {
            // Call backend logout if endpoint exists
            try {
                await fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                });
            } catch (error) {
                console.log('Backend logout failed, proceeding with client-side logout');
            }

            // Remove token from localStorage (client-side logout)
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            return { success: true, message: 'Logged out successfully' };
        } catch (error) {
            console.error('❌ Logout failed:', error);
            // Still remove token from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return { success: true, message: 'Logged out locally' };
        }
    },

    // Appointments
    getAppointments: async() => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch appointments: ${response.status}`);
            }

            const data = await response.json();
            return data.data || data || [];
        } catch (error) {
            console.error('❌ Failed to fetch appointments:', error);

            // Fallback to localStorage for demo purposes
            try {
                const storedAppointments = localStorage.getItem('medicare_appointments');
                if (storedAppointments) {
                    return JSON.parse(storedAppointments);
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }

            return [];
        }
    },

    createAppointment: async(appointmentData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(appointmentData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to create appointment'
                };
            }

            return {
                success: true,
                appointment: data.appointment || data,
                message: data.message || 'Appointment created successfully'
            };
        } catch (error) {
            console.error('❌ Failed to create appointment:', error);
            return {
                success: false,
                message: 'Failed to create appointment - network error'
            };
        }
    },

    // Users
    getUsers: async() => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.status}`);
            }

            const data = await response.json();
            return data.data || data || [];
        } catch (error) {
            console.error('❌ Failed to fetch users:', error);
            return [];
        }
    },

    // Doctors
    getDoctors: async() => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch doctors: ${response.status}`);
            }

            const data = await response.json();
            return data.data || data || [];
        } catch (error) {
            console.error('❌ Failed to fetch doctors:', error);
            return [];
        }
    },

    // Get doctor by user ID
    getDoctorByUserId: async(userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/user/${userId}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch doctor: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Failed to fetch doctor:', error);
            return { success: false, message: 'Failed to fetch doctor profile' };
        }
    },

    // Pharmacy
    getMedicines: async() => {
        try {
            const response = await fetch(`${API_BASE_URL}/medicines`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch medicines: ${response.status}`);
            }

            const data = await response.json();
            return data.data || data || [];
        } catch (error) {
            console.error('❌ Failed to fetch medicines:', error);
            return [];
        }
    },

    createOrder: async(orderData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to create order'
                };
            }

            return {
                success: true,
                order: data.order || data,
                message: data.message || 'Order created successfully'
            };
        } catch (error) {
            console.error('❌ Failed to create order:', error);
            return {
                success: false,
                message: 'Failed to create order - network error'
            };
        }
    },

    // ========== DOCTOR-SPECIFIC APIS ==========

    // Get doctor's appointments
    getDoctorAppointments: async(doctorId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/appointments`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch doctor appointments: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Failed to fetch doctor appointments:', error);
            return { success: false, message: 'Failed to fetch appointments' };
        }
    },

    // Get doctor's patients
    getDoctorPatients: async(doctorId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/patients`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch doctor patients: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Failed to fetch doctor patients:', error);
            return { success: false, message: 'Failed to fetch patients' };
        }
    },

    // Update appointment status
    updateAppointment: async(appointmentId, updateData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to update appointment'
                };
            }

            return {
                success: true,
                appointment: data.appointment || data,
                message: data.message || 'Appointment updated successfully'
            };
        } catch (error) {
            console.error('❌ Failed to update appointment:', error);
            return {
                success: false,
                message: 'Failed to update appointment - network error'
            };
        }
    },

    // Create medical record
    createMedicalRecord: async(recordData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medical-records`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(recordData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to create medical record'
                };
            }

            return {
                success: true,
                record: data.record || data,
                message: data.message || 'Medical record created successfully'
            };
        } catch (error) {
            console.error('❌ Failed to create medical record:', error);
            return {
                success: false,
                message: 'Failed to create medical record - network error'
            };
        }
    },

    // Update doctor schedule
    updateDoctorSchedule: async(doctorId, scheduleData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/schedule`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(scheduleData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to update schedule'
                };
            }

            return {
                success: true,
                schedule: data.schedule || data,
                message: data.message || 'Schedule updated successfully'
            };
        } catch (error) {
            console.error('❌ Failed to update schedule:', error);
            return {
                success: false,
                message: 'Failed to update schedule - network error'
            };
        }
    },

    // Request leave
    requestLeave: async(doctorId, leaveData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/leave`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(leaveData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to submit leave request'
                };
            }

            return {
                success: true,
                leave: data.leave || data,
                message: data.message || 'Leave request submitted successfully'
            };
        } catch (error) {
            console.error('❌ Failed to submit leave request:', error);
            return {
                success: false,
                message: 'Failed to submit leave request - network error'
            };
        }
    },

    // Download patient report
    downloadPatientReport: async(patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}/report`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to download report: ${response.status}`);
            }

            const blob = await response.blob();
            return {
                success: true,
                data: blob,
                message: 'Report downloaded successfully'
            };
        } catch (error) {
            console.error('❌ Failed to download report:', error);
            return {
                success: false,
                message: 'Failed to download report'
            };
        }
    },

    // Send prescription
    sendPrescription: async(patientId, prescription) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}/prescription`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ prescription }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to send prescription'
                };
            }

            return {
                success: true,
                message: data.message || 'Prescription sent successfully'
            };
        } catch (error) {
            console.error('❌ Failed to send prescription:', error);
            return {
                success: false,
                message: 'Failed to send prescription - network error'
            };
        }
    },

    // Schedule follow-up
    scheduleFollowUp: async(patientId, followUpDate) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}/follow-up`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ followUpDate }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to schedule follow-up'
                };
            }

            return {
                success: true,
                message: data.message || 'Follow-up scheduled successfully'
            };
        } catch (error) {
            console.error('❌ Failed to schedule follow-up:', error);
            return {
                success: false,
                message: 'Failed to schedule follow-up - network error'
            };
        }
    },

    // Get patient records
    getPatientRecords: async(patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}/records`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch patient records: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Failed to fetch patient records:', error);
            return { success: false, message: 'Failed to fetch patient records' };
        }
    },

    // ========== PATIENT-SPECIFIC APIS ==========

    // Get patient profile
    getPatientProfile: async(userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/profile/me`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch patient profile: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Failed to fetch patient profile:', error);
            return { success: false, message: 'Failed to fetch patient profile' };
        }
    },

    // Get patient appointments
    getPatientAppointments: async(patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}/appointments`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch patient appointments: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Failed to fetch patient appointments:', error);
            return { success: false, message: 'Failed to fetch appointments' };
        }
    },

    // Get medical history
    getMedicalHistory: async(patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medical-history`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch medical history: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Failed to fetch medical history:', error);
            return { success: false, message: 'Failed to fetch medical history' };
        }
    },

    // Get patient bills
    getPatientBills: async(patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}/bills`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch patient bills: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Failed to fetch patient bills:', error);
            return { success: false, message: 'Failed to fetch bills' };
        }
    },

    // Update patient profile
    updatePatientProfile: async(patientId, profileData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to update profile'
                };
            }

            return {
                success: true,
                patient: data.patient || data,
                message: data.message || 'Profile updated successfully'
            };
        } catch (error) {
            console.error('❌ Failed to update patient profile:', error);
            return {
                success: false,
                message: 'Failed to update profile - network error'
            };
        }
    },

    // Pay bill
    payBill: async(billId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bills/${billId}/pay`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to process payment'
                };
            }

            return {
                success: true,
                message: data.message || 'Payment processed successfully'
            };
        } catch (error) {
            console.error('❌ Failed to process payment:', error);
            return {
                success: false,
                message: 'Failed to process payment - network error'
            };
        }
    },

    // Download medical report
    downloadMedicalReport: async(patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medical-report`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to download medical report: ${response.status}`);
            }

            const blob = await response.blob();
            return {
                success: true,
                data: blob,
                message: 'Medical report downloaded successfully'
            };
        } catch (error) {
            console.error('❌ Failed to download medical report:', error);
            return {
                success: false,
                message: 'Failed to download medical report'
            };
        }
    },

    // ========== ADMIN-SPECIFIC APIS ==========

    // Delete user
    deleteUser: async(userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to delete user'
                };
            }

            return {
                success: true,
                message: data.message || 'User deleted successfully'
            };
        } catch (error) {
            console.error('❌ Failed to delete user:', error);
            return {
                success: false,
                message: 'Failed to delete user - network error'
            };
        }
    },

    // Update user status
    updateUserStatus: async(userId, statusData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(statusData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to update user status'
                };
            }

            return {
                success: true,
                user: data.user || data,
                message: data.message || 'User status updated successfully'
            };
        } catch (error) {
            console.error('❌ Failed to update user status:', error);
            return {
                success: false,
                message: 'Failed to update user status - network error'
            };
        }
    },
    getPatients: async() => {
        try {
            const response = await fetch(`${API_BASE_URL}/patients`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error(`Failed to fetch patients: ${response.status}`);

            const data = await response.json();
            return data.data || data || [];
        } catch (error) {
            console.error('❌ Failed to fetch patients:', error);
            return [];
        }
    },

    // ✅ NEW METHODS GO HERE — inside api object
    getDoctorsWithStats: async() => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors-with-stats`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error(`Failed to fetch doctors with stats: ${response.status}`);

            const data = await response.json();
            return data.data || data || [];
        } catch (error) {
            console.error('❌ Failed to fetch doctors with stats:', error);
            return [];
        }
    },

    getDoctorStats: async(doctorId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/stats`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error(`Failed to fetch doctor stats: ${response.status}`);

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Failed to fetch doctor stats:', error);
            return { success: false, message: 'Failed to fetch doctor statistics' };
        }
    }
};

// ✅ Optional: separate export for auth-specific methods
export const authAPI = {
    login: api.login,
    register: api.register,
    getCurrentUser: api.getCurrentUser,
    logout: api.logout
};

// ✅ Default export
export default api;
