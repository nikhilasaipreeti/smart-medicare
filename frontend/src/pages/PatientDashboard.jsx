// pages/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [patientProfile, setPatientProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [bills, setBills] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showBookAppointmentModal, setShowBookAppointmentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);

      if (!userData) {
        navigate('/login');
        return;
      }

      // Fetch patient profile
      const patientResult = await api.getPatientProfile(userData.id);
      if (patientResult.success) {
        setPatientProfile(patientResult.data);
        setProfileData({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          dateOfBirth: patientResult.data.dateOfBirth ? new Date(patientResult.data.dateOfBirth).toISOString().split('T')[0] : '',
          gender: patientResult.data.gender || '',
          bloodGroup: patientResult.data.bloodGroup || '',
          address: patientResult.data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          }
        });
      }

      // Fetch patient's appointments
      const appointmentsResult = await api.getPatientAppointments(userData.id);
      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.data || []);
      }

      // Fetch medical history
      const medicalResult = await api.getMedicalHistory(userData.id);
      if (medicalResult.success) {
        setMedicalHistory(medicalResult.data || []);
      }

      // Fetch bills
      const billsResult = await api.getPatientBills(userData.id);
      if (billsResult.success) {
        setBills(billsResult.data || []);
      }

      // Fetch doctors for booking
      const doctorsResult = await api.getDoctors();
      if (doctorsResult.length > 0) {
        setDoctors(doctorsResult);
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
      alert('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const result = await api.createAppointment(newAppointment);
      if (result.success) {
        alert('Appointment booked successfully!');
        setShowBookAppointmentModal(false);
        setNewAppointment({
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '',
          reason: ''
        });
        fetchPatientData(); // Refresh appointments
      } else {
        alert(result.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const result = await api.updatePatientProfile(user.id, profileData);
      if (result.success) {
        alert('Profile updated successfully!');
        setShowProfileModal(false);
        fetchPatientData(); // Refresh profile data
      } else {
        alert(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const result = await api.updateAppointment(appointmentId, { status: 'Cancelled' });
        if (result.success) {
          alert('Appointment cancelled successfully');
          fetchPatientData(); // Refresh appointments
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Error cancelling appointment');
      }
    }
  };

  const payBill = async (billId) => {
    try {
      const result = await api.payBill(billId);
      if (result.success) {
        alert('Payment processed successfully!');
        fetchPatientData(); // Refresh bills
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment');
    }
  };

  const downloadMedicalReport = async () => {
    try {
      const result = await api.downloadMedicalReport(user.id);
      if (result.success) {
        // Create download link
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `medical-report-${user.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading medical report');
    }
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.appointmentDate.split('T')[0] >= today && 
      apt.status !== 'Cancelled' && 
      apt.status !== 'Completed'
    );
  };

  const getPastAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.appointmentDate.split('T')[0] < today || 
      apt.status === 'Completed'
    );
  };

  const getPendingBills = () => {
    return bills.filter(bill => bill.status === 'Pending');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowBookAppointmentModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📅</span>
                <span>Book Appointment</span>
              </button>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>👤</span>
                <span>Profile</span>
              </button>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Patient Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600">Upcoming Appointments</p>
              <p className="text-2xl font-bold text-blue-800">{getUpcomingAppointments().length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600">Pending Bills</p>
              <p className="text-2xl font-bold text-green-800">{getPendingBills().length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600">Medical Records</p>
              <p className="text-2xl font-bold text-purple-800">{medicalHistory.length}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600">Total Visits</p>
              <p className="text-2xl font-bold text-orange-800">{getPastAppointments().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'appointments', label: 'Appointments', icon: '📋' },
              { key: 'medical', label: 'Medical History', icon: '🏥' },
              { key: 'bills', label: 'Bills & Payments', icon: '💰' },
              { key: 'prescriptions', label: 'Prescriptions', icon: '💊' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Upcoming Appointments</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {getUpcomingAppointments().length} appointments
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {getUpcomingAppointments().length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No upcoming appointments</p>
                    <button 
                      onClick={() => setShowBookAppointmentModal(true)}
                      className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Book Your First Appointment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getUpcomingAppointments().map(appointment => (
                      <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800">
                              Dr. {appointment.doctorId?.userId?.firstName} {appointment.doctorId?.userId?.lastName}
                            </h3>
                            <p className="text-gray-600">{appointment.doctorId?.specialization}</p>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                              <div>
                                <p><span className="font-medium">Date:</span> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                                <p><span className="font-medium">Time:</span> {appointment.appointmentTime}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Reason:</span> {appointment.reason}</p>
                                <p><span className="font-medium">Fee:</span> ${appointment.doctorId?.consultationFee}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              appointment.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status}
                            </span>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => cancelAppointment(appointment._id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                Cancel
                              </button>
                              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                                Reschedule
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Past Appointments */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Appointment History</h2>
              </div>
              <div className="p-6">
                {getPastAppointments().length === 0 ? (
                  <p className="text-gray-500">No past appointments</p>
                ) : (
                  <div className="space-y-3">
                    {getPastAppointments().slice(0, 5).map(appointment => (
                      <div key={appointment._id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                        <div>
                          <p className="font-medium">Dr. {appointment.doctorId?.userId?.firstName} {appointment.doctorId?.userId?.lastName}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.appointmentDate).toLocaleDateString()} - {appointment.reason}
                          </p>
                        </div>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medical History Tab */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Medical History</h2>
              <button 
                onClick={downloadMedicalReport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Medical Report
              </button>
            </div>
            
            <div className="grid gap-4">
              {medicalHistory.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
                  <p className="text-gray-500 text-lg">No medical records found</p>
                  <p className="text-gray-400 mt-2">Your medical history will appear here after appointments</p>
                </div>
              ) : (
                medicalHistory.map(record => (
                  <div key={record._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800">
                          Visit on {new Date(record.visitDate).toLocaleDateString()}
                        </h3>
                        <p className="text-gray-600">Dr. {record.doctorName}</p>
                        <div className="mt-3 space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Diagnosis:</span>
                            <p className="text-gray-600 ml-2">{record.diagnosis}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Prescription:</span>
                            <p className="text-gray-600 ml-2">{record.prescription}</p>
                          </div>
                          {record.notes && (
                            <div>
                              <span className="font-medium text-gray-700">Notes:</span>
                              <p className="text-gray-600 ml-2">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bills & Payments Tab */}
        {activeTab === 'bills' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Bills & Payments</h2>
            
            {/* Pending Bills */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Pending Payments</h3>
              </div>
              <div className="p-6">
                {getPendingBills().length === 0 ? (
                  <p className="text-gray-500">No pending bills</p>
                ) : (
                  <div className="space-y-4">
                    {getPendingBills().map(bill => (
                      <div key={bill._id} className="flex justify-between items-center p-4 border border-gray-200 rounded">
                        <div>
                          <h4 className="font-semibold">Bill #{bill.billNumber}</h4>
                          <p className="text-gray-600">Date: {new Date(bill.date).toLocaleDateString()}</p>
                          <p className="text-gray-600">Service: {bill.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">${bill.amount}</p>
                          <button 
                            onClick={() => payBill(bill._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors mt-2"
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
              </div>
              <div className="p-6">
                {bills.filter(bill => bill.status === 'Paid').length === 0 ? (
                  <p className="text-gray-500">No payment history</p>
                ) : (
                  <div className="space-y-3">
                    {bills.filter(bill => bill.status === 'Paid').map(bill => (
                      <div key={bill._id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                        <div>
                          <p className="font-medium">Bill #{bill.billNumber}</p>
                          <p className="text-sm text-gray-600">{new Date(bill.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${bill.amount}</p>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Paid</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Current Prescriptions</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              {medicalHistory.filter(record => record.prescription).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No active prescriptions</p>
                  <p className="text-gray-400 mt-2">Your prescriptions will appear here after doctor visits</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalHistory
                    .filter(record => record.prescription)
                    .slice(0, 3)
                    .map(record => (
                      <div key={record._id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-gray-800">
                          From Dr. {record.doctorName}
                        </h3>
                        <p className="text-gray-600 mt-2">
                          <span className="font-medium">Prescribed on:</span> {new Date(record.visitDate).toLocaleDateString()}
                        </p>
                        <div className="mt-3 bg-blue-50 p-3 rounded">
                          <p className="text-blue-800">{record.prescription}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBookAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Book New Appointment</h3>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                <select 
                  value={newAppointment.doctorId}
                  onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.userId?.firstName} {doctor.userId?.lastName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input 
                  type="date" 
                  value={newAppointment.appointmentDate}
                  onChange={(e) => setNewAppointment({...newAppointment, appointmentDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <select 
                  value={newAppointment.appointmentTime}
                  onChange={(e) => setNewAppointment({...newAppointment, appointmentTime: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea 
                  value={newAppointment.reason}
                  onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  placeholder="Briefly describe the reason for your visit..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowBookAppointmentModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input 
                    type="text" 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full p-2 border rounded" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input 
                    type="text" 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full p-2 border rounded" 
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full p-2 border rounded" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input 
                    type="tel" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full p-2 border rounded" 
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input 
                    type="date" 
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select 
                    value={profileData.gender}
                    onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <select 
                    value={profileData.bloodGroup}
                    onChange={(e) => setProfileData({...profileData, bloodGroup: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input 
                    type="text" 
                    placeholder="Street"
                    value={profileData.address.street}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      address: {...profileData.address, street: e.target.value}
                    })}
                    className="p-2 border rounded" 
                  />
                  <input 
                    type="text" 
                    placeholder="City"
                    value={profileData.address.city}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      address: {...profileData.address, city: e.target.value}
                    })}
                    className="p-2 border rounded" 
                  />
                  <input 
                    type="text" 
                    placeholder="State"
                    value={profileData.address.state}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      address: {...profileData.address, state: e.target.value}
                    })}
                    className="p-2 border rounded" 
                  />
                  <input 
                    type="text" 
                    placeholder="ZIP Code"
                    value={profileData.address.zipCode}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      address: {...profileData.address, zipCode: e.target.value}
                    })}
                    className="p-2 border rounded" 
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;